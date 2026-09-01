const { verifyRecaptcha } = require('../services/recaptchaService');
const { sendTelegramNotification } = require('../services/telegramService');

const ALLOWED_FIELDS = new Set([
  'requested_product',
  'name',
  'phone',
  'total_sum',
  'recaptcha_token',
  'location',
]);
const NAME_PATTERN = /^[\p{L}\p{M} .'-]{2,80}$/u;
const NAME_LETTER_PATTERN = /\p{L}/u;
const PHONE_PATTERN = /^[+()\d\s-]{7,30}$/;
const ALLOWED_PRODUCTS = new Set(['vortex', 'tecdoc']);

function normalizeAndValidateTrialRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false };
  }

  const hasUnexpectedFields = Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key));
  if (hasUnexpectedFields) {
    return { valid: false };
  }

  if (!ALLOWED_PRODUCTS.has(body.requested_product)) {
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

  let location = null;
  if (body.location !== null && body.location !== undefined) {
    const allowedLocationFields = new Set(['latitude', 'longitude', 'accuracy']);
    if (
      typeof body.location !== 'object'
      || Array.isArray(body.location)
      || Object.keys(body.location).some((key) => !allowedLocationFields.has(key))
      || typeof body.location.latitude !== 'number'
      || typeof body.location.longitude !== 'number'
      || !Number.isFinite(body.location.latitude)
      || !Number.isFinite(body.location.longitude)
      || body.location.latitude < -90
      || body.location.latitude > 90
      || body.location.longitude < -180
      || body.location.longitude > 180
    ) {
      return { valid: false };
    }

    location = {
      latitude: body.location.latitude,
      longitude: body.location.longitude,
    };

    if (
      typeof body.location.accuracy === 'number'
      && Number.isFinite(body.location.accuracy)
      && body.location.accuracy >= 0
      && body.location.accuracy <= 100000
    ) {
      location.accuracy = body.location.accuracy;
    }
  }

  return {
    valid: true,
    data: {
      requested_product: body.requested_product,
      name,
      phone,
      total_sum: Math.round(body.total_sum * 100) / 100,
      recaptcha_token: body.recaptcha_token,
      location,
    },
  };
}

async function submitTrialRequest(req, res) {
  if (!req.is('application/json')) {
    return res.status(415).json({ message: 'Потрібен JSON-запит.' });
  }

  const validation = normalizeAndValidateTrialRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({ message: 'Перевірте введені дані.' });
  }

  try {
    const recaptchaIsValid = await verifyRecaptcha(
      validation.data.recaptcha_token,
      req.ip,
    );

    if (!recaptchaIsValid) {
      return res.status(400).json({ message: 'Перевірка reCAPTCHA не пройдена.' });
    }

    const { requested_product, ...notificationData } = validation.data;
    await sendTelegramNotification(requested_product, notificationData);
    return res.status(200).json({ message: 'Заявку відправлено.' });
  } catch (error) {
    if (error.code === 'PRODUCT_NOT_IMPLEMENTED') {
      return res.status(501).json({ message: 'Заявки TecDoc ще не підтримуються.' });
    }

    if (
      error.code === 'RECAPTCHA_NOT_CONFIGURED'
      || error.code === 'TELEGRAM_NOT_CONFIGURED'
    ) {
      return res.status(503).json({ message: 'Сервіс заявок ще не налаштовано.' });
    }

    console.error('Trial request delivery failed:', error.code || error.name);
    return res.status(502).json({ message: 'Не вдалося доставити заявку. Спробуйте пізніше.' });
  }
}

module.exports = {
  normalizeAndValidateTrialRequest,
  submitTrialRequest,
};
