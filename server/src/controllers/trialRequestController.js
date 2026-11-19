const { verifyRecaptcha } = require('../services/recaptchaService');
const { sendTelegramNotification } = require('../services/telegramService');
const { buildDirectorComment, directorLink, submitToDirector } = require('../services/directorService');
const cms = require('../services/cmsService');

const ALLOWED_FIELDS = new Set([
  'requested_product',
  'name',
  'phone',
  'total_sum',
  'recaptcha_token',
  'source_page',
  'language',
  'website_package',
  'calculator',
  'utm',
  'page_path',
  'elapsed_ms',
  'company_site',
  // Accepted and ignored so a tab opened before the geolocation button was removed can still submit.
  'location',
]);
const NAME_PATTERN = /^[\p{L}\p{M} .'-]{2,80}$/u;
const NAME_LETTER_PATTERN = /\p{L}/u;
const PHONE_PATTERN = /^[+()\d\s-]{7,30}$/;
const ALLOWED_PRODUCTS = new Set(['vortex', 'tecdoc']);
const ALLOWED_SOURCES = new Set(['home', 'contact', 'car-service', 'websites', 'auto-dismantling', 'tecdoc-license']);
const PACKAGE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/;
const ALLOWED_LANGUAGES = new Set(['ua', 'cz', 'sk', 'en', 'pl']);
const CALCULATOR_FIELDS = new Set(['manager_count', 'store_count', 'integrations']);
const UTM_FIELDS = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']);
const PAGE_PATH_PATTERN = /^\/[A-Za-z0-9\-._~%/]{0,199}$/;
const MAX_CALCULATOR_COUNT = 1000;
const MAX_INTEGRATIONS = 20;
const MAX_UTM_LENGTH = 100;
const MIN_FILL_TIME_MS = 3000;
const SUCCESS_MESSAGE = 'Заявку відправлено.';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isCount = (value) => Number.isInteger(value) && value >= 0 && value <= MAX_CALCULATOR_COUNT;

/** Honeypot filled or the form sent faster than a person can fill it. */
function looksLikeBot(body) {
  if (!isPlainObject(body)) return false;
  if (typeof body.company_site === 'string' && body.company_site.trim() !== '') return true;
  return typeof body.elapsed_ms === 'number' && Number.isFinite(body.elapsed_ms) && body.elapsed_ms < MIN_FILL_TIME_MS;
}

function validateCalculator(value) {
  if (
    !isPlainObject(value)
    || Object.keys(value).some((key) => !CALCULATOR_FIELDS.has(key))
    || !isCount(value.manager_count)
    || !isCount(value.store_count)
    || !Array.isArray(value.integrations)
    || value.integrations.length > MAX_INTEGRATIONS
    || value.integrations.some((id) => typeof id !== 'string' || !PACKAGE_ID.test(id))
  ) {
    return null;
  }

  return {
    manager_count: value.manager_count,
    store_count: value.store_count,
    integrations: [...new Set(value.integrations)],
  };
}

function validateUtm(value) {
  if (!isPlainObject(value) || Object.keys(value).some((key) => !UTM_FIELDS.has(key))) return undefined;
  const utm = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw !== 'string' || raw.length > MAX_UTM_LENGTH) return undefined;
    const cleaned = raw.normalize('NFKC').replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').trim();
    if (cleaned) utm[key] = cleaned;
  }
  return utm;
}

function normalizeAndValidateTrialRequest(body) {
  if (!isPlainObject(body)) {
    return { valid: false };
  }

  const hasUnexpectedFields = Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key));
  if (hasUnexpectedFields) {
    return { valid: false };
  }

  if (!ALLOWED_PRODUCTS.has(body.requested_product)) {
    return { valid: false };
  }

  const sourcePage = body.source_page ?? 'home';
  const language = body.language ?? 'ua';
  if (!ALLOWED_SOURCES.has(sourcePage) || !ALLOWED_LANGUAGES.has(language)) {
    return { valid: false };
  }

  if (body.website_package !== undefined && (
    sourcePage !== 'websites' || typeof body.website_package !== 'string' || !PACKAGE_ID.test(body.website_package)
  )) {
    return { valid: false };
  }

  if (typeof body.name !== 'string' || typeof body.phone !== 'string') {
    return { valid: false };
  }

  const name = body.name.normalize('NFKC').trim().replace(/\s+/g, ' ');
  const phone = body.phone.normalize('NFKC').trim();
  const phoneDigits = phone.replace(/\D/g, '');

  if (!NAME_PATTERN.test(name) || !NAME_LETTER_PATTERN.test(name)) {
    return { valid: false };
  }

  if (
    !PHONE_PATTERN.test(phone)
    || phoneDigits.length < 7
    || phoneDigits.length > 15
  ) {
    return { valid: false };
  }

  if (
    typeof body.total_sum !== 'number'
    || !Number.isFinite(body.total_sum)
    || body.total_sum < 0
    || body.total_sum > 1000000
  ) {
    return { valid: false };
  }

  if (
    typeof body.recaptcha_token !== 'string'
    || body.recaptcha_token.length < 10
    || body.recaptcha_token.length > 4096
  ) {
    return { valid: false };
  }

  let calculator;
  if (body.calculator !== undefined && body.calculator !== null) {
    // The calculator only prices the Vortex trial, never a website package or TecDoc license.
    if (body.requested_product !== 'vortex' || body.website_package !== undefined) return { valid: false };
    calculator = validateCalculator(body.calculator);
    if (!calculator) return { valid: false };
  }

  // UTM and page path are only context for staff: malformed values are dropped
  // instead of rejecting a real visitor's request.
  const utm = body.utm === undefined || body.utm === null ? undefined : validateUtm(body.utm);
  const pagePath = typeof body.page_path === 'string' && PAGE_PATH_PATTERN.test(body.page_path)
    ? body.page_path
    : undefined;

  if (body.elapsed_ms !== undefined && (
    typeof body.elapsed_ms !== 'number' || !Number.isFinite(body.elapsed_ms) || body.elapsed_ms < 0
  )) {
    return { valid: false };
  }

  if (body.company_site !== undefined && (typeof body.company_site !== 'string' || body.company_site.length > 200)) {
    return { valid: false };
  }

  if (body.location !== undefined && body.location !== null && !isPlainObject(body.location)) {
    return { valid: false };
  }

  return {
    valid: true,
    data: {
      source_page: sourcePage,
      language,
      ...(body.website_package !== undefined ? { website_package: body.website_package } : {}),
      requested_product: body.requested_product,
      name,
      phone,
      total_sum: Math.round(body.total_sum * 100) / 100,
      recaptcha_token: body.recaptcha_token,
      ...(calculator ? { calculator } : {}),
      ...(utm && Object.keys(utm).length ? { utm } : {}),
      ...(pagePath ? { page_path: pagePath } : {}),
    },
  };
}

/**
 * In-memory limit of successful requests per phone number (last 9 digits, so
 * +380 67…, 067… and 67… count as one number).
 */
function createPhoneLimiter({ windowMs = 24 * 60 * 60 * 1000, max = 3, maxTracked = 10000, now = Date.now } = {}) {
  const entries = new Map();
  const keyOf = (phone) => phone.replace(/\D/g, '').slice(-9);
  const recent = (key, time) => (entries.get(key) || []).filter((timestamp) => time - timestamp < windowMs);

  return {
    isLimited(phone) {
      const key = keyOf(phone);
      const time = now();
      const list = recent(key, time);
      if (list.length) entries.set(key, list);
      else entries.delete(key);
      return list.length >= max || (!entries.has(key) && entries.size >= maxTracked);
    },
    record(phone) {
      const key = keyOf(phone);
      const time = now();
      if (!entries.has(key) && entries.size >= maxTracked) {
        entries.forEach((timestamps, entryKey) => {
          if (!timestamps.some((timestamp) => time - timestamp < windowMs)) entries.delete(entryKey);
        });
      }
      entries.set(key, [...recent(key, time), time]);
    },
  };
}

const phoneLimiter = createPhoneLimiter();

const finitePrice = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

/**
 * Recomputes the calculator from CMS settings with the same formula as the
 * site calculator. Unknown integration ids are dropped; prices come from the
 * catalog of the language the visitor saw, labels from the Ukrainian catalog
 * because staff read the CRM in Ukrainian.
 */
function resolveCalculator(selection, catalog, language) {
  const settings = catalog?.[language]?.settings?.pricing_calculator;
  if (
    !isPlainObject(settings)
    || settings.visible === false
    || !Array.isArray(settings.integrations)
    || ![settings.base_monthly_price, settings.increment].every(finitePrice)
    || ![settings.default_manager_count, settings.default_store_count].every(Number.isFinite)
  ) {
    return null;
  }

  const staffLabels = new Map(
    (catalog?.ua?.settings?.pricing_calculator?.integrations || []).map((integration) => [integration.id, integration.label]),
  );
  const integrations = settings.integrations
    .filter((integration) => (
      selection.integrations.includes(integration.id)
      && finitePrice(integration.price)
      && (integration.billing_period === 'monthly' || integration.billing_period === 'one_time')
    ))
    .map((integration) => ({
      id: integration.id,
      label: String(staffLabels.get(integration.id) || integration.label || integration.id),
      price: integration.price,
      billing_period: integration.billing_period,
    }));

  const sumOf = (period) => integrations
    .filter((integration) => integration.billing_period === period)
    .reduce((sum, integration) => sum + integration.price, 0);
  const quantityDifference = selection.manager_count - settings.default_manager_count
    + selection.store_count - settings.default_store_count;
  const monthly = Math.max(0, settings.base_monthly_price + sumOf('monthly') + quantityDifference * settings.increment);
  const oneTime = sumOf('one_time');
  const round = (value) => Math.round(value * 100) / 100;

  return {
    manager_count: selection.manager_count,
    store_count: selection.store_count,
    integrations,
    currency: typeof settings.currency === 'string' ? settings.currency : '',
    monthly: round(monthly),
    one_time: round(oneTime),
    total: round(monthly + oneTime),
  };
}

/** Adds CMS-verified calculator and TecDoc pricing. A CMS outage only drops these details. */
async function attachPricingDetails(data) {
  if (!data.calculator && data.requested_product !== 'tecdoc') return;
  try {
    const { content } = await cms.snapshot();
    if (data.calculator) {
      const calculator = resolveCalculator(data.calculator, content, data.language);
      if (calculator) {
        data.calculator = calculator;
        data.total_sum = calculator.total;
      } else {
        delete data.calculator;
      }
    }
    const license = content?.[data.language]?.tecdoc?.license;
    if (data.requested_product === 'tecdoc' && isPlainObject(license) && license.visible !== false && finitePrice(license.price)) {
      data.tecdoc_license = { price: license.price, currency: typeof license.currency === 'string' ? license.currency : '' };
    }
  } catch (error) {
    // An unverified browser selection must not reach staff as if it were checked.
    delete data.calculator;
    console.warn('Pricing details unavailable for trial request:', error.code || error.name);
  }
}

async function submitTrialRequest(req, res) {
  if (!req.is('application/json')) {
    return res.status(415).json({ message: 'Потрібен JSON-запит.' });
  }

  if (looksLikeBot(req.body)) {
    // Bots see the normal success response, but nothing is delivered anywhere.
    console.warn('Trial request dropped by bot checks');
    return res.status(200).json({ message: SUCCESS_MESSAGE });
  }

  const validation = normalizeAndValidateTrialRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({ message: 'Перевірте введені дані.' });
  }

  const data = validation.data;
  if (phoneLimiter.isLimited(data.phone)) {
    return res.status(429).json({ message: 'Забагато заявок з цього номера. Спробуйте пізніше або зателефонуйте нам.' });
  }

  try {
    if (data.website_package) {
      const snapshot = await cms.snapshot();
      const tariff = resolveWebsiteTariff(data, snapshot.content);
      if (!tariff) return res.status(400).json({ message: 'Обраний пакет сайту недоступний.' });
      Object.assign(data, tariff, snapshot.revision === undefined ? {} : { content_revision: snapshot.revision });
    } else {
      await attachPricingDetails(data);
    }

    const recaptchaIsValid = await verifyRecaptcha(data.recaptcha_token, req.ip);
    if (!recaptchaIsValid) {
      return res.status(400).json({ message: 'Перевірка reCAPTCHA не пройдена.' });
    }

    const { requested_product, recaptcha_token, ...notificationData } = data;
    const director = await submitToDirector({
      name: data.name,
      phone: data.phone,
      comment: buildDirectorComment(data),
    });

    let telegramError = null;
    try {
      await sendTelegramNotification(requested_product, { ...notificationData, director_link: directorLink(director) });
    } catch (error) {
      telegramError = error;
    }

    // The request counts as delivered when at least one channel has it.
    if (director.ok || !telegramError) {
      phoneLimiter.record(data.phone);
      if (telegramError) {
        console.error('Telegram notification failed, request is saved in Director:', telegramError.code || telegramError.name);
      }
      return res.status(200).json({ message: SUCCESS_MESSAGE });
    }

    if (telegramError.code === 'TELEGRAM_NOT_CONFIGURED' && director.skipped) {
      return res.status(503).json({ message: 'Сервіс заявок ще не налаштовано.' });
    }
    console.error('Trial request delivery failed:', telegramError.code || telegramError.name, 'director:', director.reason);
    return res.status(502).json({ message: 'Не вдалося доставити заявку. Спробуйте пізніше.' });
  } catch (error) {
    if (
      error.code === 'RECAPTCHA_NOT_CONFIGURED'
      || error.code?.startsWith('CONTENT_')
    ) {
      return res.status(503).json({ message: 'Сервіс заявок ще не налаштовано.' });
    }

    console.error('Trial request delivery failed:', error.code || error.name);
    return res.status(502).json({ message: 'Не вдалося доставити заявку. Спробуйте пізніше.' });
  }
}

function resolveWebsiteTariff(data, catalog) {
  const content = catalog[data.language];
  const pricing = content?.websites?.pricing;
  let tariff;
  if (pricing !== undefined) {
    if (pricing.visible === false) return null;
    tariff = pricing.tariffs?.find(item => item.id === data.website_package && item.visible !== false);
  } else if (!cms.configured()) {
    const legacyPrices = { free: 0, practical: 300, maximum: 500 };
    if (Object.hasOwn(legacyPrices, data.website_package)) tariff = { id: data.website_package, name: data.website_package, price: legacyPrices[data.website_package], currency: 'USD', billing_type: data.website_package === 'free' ? 'free' : 'one_time' };
  }
  if (!tariff || !Number.isFinite(tariff.price) || tariff.price < 0 || !/^[A-Z]{3}$/.test(tariff.currency)
    || !['free', 'monthly', 'one_time'].includes(tariff.billing_type)) return null;
  return { total_sum: tariff.price, total_currency: tariff.currency, billing_type: tariff.billing_type, website_package_name: tariff.name };
}

module.exports = {
  createPhoneLimiter,
  looksLikeBot,
  normalizeAndValidateTrialRequest,
  resolveCalculator,
  submitTrialRequest,
  resolveWebsiteTariff,
};
