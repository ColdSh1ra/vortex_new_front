const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAndValidateTrialRequest } = require('../src/controllers/trialRequestController');
const { buildTelegramMessage } = require('../src/services/telegramService');

const request = {
  requested_product: 'vortex',
  name: '  Антон   Васильєв ',
  phone: '+380 97 123 45 67',
  total_sum: 120,
  recaptcha_token: 'test-token-not-sent-anywhere',
  source_page: 'car-service',
  language: 'sk',
};

test('workshop source and selected language reach the notification', () => {
  const result = normalizeAndValidateTrialRequest(request);
  assert.equal(result.valid, true);
  assert.equal(result.data.name, 'Антон Васильєв');
  const message = buildTelegramMessage(result.data);
  assert.match(message, /Сторінка: Облік СТО/);
  assert.match(message, /Мова: sk/);
  assert.match(message, /Розрахована сума: \$120/);
});

test('accepts each supported source and locale and rejects untrusted metadata', () => {
  for (const source_page of ['home', 'contact', 'car-service']) {
    for (const language of ['ua', 'cz', 'sk', 'en', 'pl']) {
      assert.equal(normalizeAndValidateTrialRequest({ ...request, source_page, language }).valid, true);
    }
  }
  for (const source_page of ['', '/car-service', '<script>', 'other']) {
    assert.equal(normalizeAndValidateTrialRequest({ ...request, source_page }).valid, false);
  }
  assert.equal(normalizeAndValidateTrialRequest({ ...request, language: 'de' }).valid, false);
  assert.equal(normalizeAndValidateTrialRequest({ ...request, extra: true }).valid, false);
});

test('older request clients keep default source and language', () => {
  const { source_page, language, ...legacy } = request;
  const result = normalizeAndValidateTrialRequest(legacy);
  assert.equal(result.valid, true);
  assert.equal(result.data.source_page, 'home');
  assert.equal(result.data.language, 'ua');
});

const {
  createPhoneLimiter,
  looksLikeBot,
  resolveCalculator,
} = require('../src/controllers/trialRequestController');

const calculatorSettings = (overrides = {}) => ({
  settings: {
    pricing_calculator: {
      currency: '$',
      base_monthly_price: 50,
      increment: 20,
      default_manager_count: 3,
      default_store_count: 1,
      integrations: [
        { id: 'tecdoc', label: 'TecDoc', price: 25, billing_period: 'monthly', selected_by_default: false },
        { id: 'binotel', label: 'Binotel', price: 50, billing_period: 'one_time', selected_by_default: true },
        { id: 'nova-poshta', label: 'Nova Poshta', price: 20, billing_period: 'one_time', selected_by_default: true },
      ],
      ...overrides,
    },
  },
});

test('calculator selection, UTM and page path are validated strictly', () => {
  const calculator = { manager_count: 4, store_count: 1, integrations: ['tecdoc', 'binotel', 'tecdoc'] };
  const result = normalizeAndValidateTrialRequest({
    ...request,
    calculator,
    utm: { utm_source: ' google ', utm_medium: 'cpc', utm_term: '' },
    page_path: '/car-service',
    elapsed_ms: 12000,
    company_site: '',
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.data.calculator, { manager_count: 4, store_count: 1, integrations: ['tecdoc', 'binotel'] });
  assert.deepEqual(result.data.utm, { utm_source: 'google', utm_medium: 'cpc' });
  assert.equal(result.data.page_path, '/car-service');
  assert.equal('elapsed_ms' in result.data || 'company_site' in result.data || 'location' in result.data, false);

  // Below the calculator floor (3 managers, 1 branch) the selection is raised to it, not rejected.
  const belowFloor = normalizeAndValidateTrialRequest({
    ...request,
    calculator: { manager_count: 1, store_count: 0, integrations: [] },
  });
  assert.equal(belowFloor.valid, true);
  assert.deepEqual(belowFloor.data.calculator, { manager_count: 3, store_count: 1, integrations: [] });

  const invalid = [
    { calculator: { ...calculator, extra: 1 } },
    { calculator: { ...calculator, manager_count: -1 } },
    { calculator: { ...calculator, store_count: 1.5 } },
    { calculator: { ...calculator, integrations: ['<script>'] } },
    { calculator, requested_product: 'tecdoc' },
    { elapsed_ms: 'fast' },
    { company_site: 42 },
  ];
  for (const overrides of invalid) {
    assert.equal(normalizeAndValidateTrialRequest({ ...request, ...overrides }).valid, false, JSON.stringify(overrides));
  }

  // Context-only fields are dropped when malformed, so a real visitor is never rejected for them.
  for (const overrides of [
    { utm: { utm_source: 'x', gclid: 'y' } },
    { utm: { utm_source: 'x'.repeat(101) } },
    { utm: 'google' },
    { page_path: 'https://evil.example/' },
    { page_path: '/a b' },
    { page_path: 42 },
  ]) {
    const dropped = normalizeAndValidateTrialRequest({ ...request, ...overrides });
    assert.equal(dropped.valid, true, JSON.stringify(overrides));
    assert.equal('utm' in dropped.data || 'page_path' in dropped.data, false);
  }
});

test('honeypot and too-fast submissions are treated as bots', () => {
  assert.equal(looksLikeBot({ ...request, company_site: 'https://spam.example' }), true);
  assert.equal(looksLikeBot({ ...request, elapsed_ms: 900 }), true);
  assert.equal(looksLikeBot({ ...request, elapsed_ms: 3000, company_site: '' }), false);
  assert.equal(looksLikeBot(request), false);
});

test('server recomputes the calculator total from CMS prices and ignores unknown add-ons', () => {
  const catalog = {
    ua: calculatorSettings({ integrations: calculatorSettings().settings.pricing_calculator.integrations.map((item) => (
      item.id === 'nova-poshta' ? { ...item, label: 'Нова пошта' } : item
    )) }),
    en: calculatorSettings(),
  };
  const resolved = resolveCalculator(
    { manager_count: 4, store_count: 1, integrations: ['tecdoc', 'binotel', 'nova-poshta', 'fake'] },
    catalog,
    'en',
  );
  assert.deepEqual(resolved, {
    manager_count: 4,
    store_count: 1,
    currency: '$',
    monthly: 95,
    one_time: 70,
    total: 165,
    integrations: [
      { id: 'tecdoc', label: 'TecDoc', price: 25, billing_period: 'monthly' },
      { id: 'binotel', label: 'Binotel', price: 50, billing_period: 'one_time' },
      { id: 'nova-poshta', label: 'Нова пошта', price: 20, billing_period: 'one_time' },
    ],
  });
  assert.equal(resolveCalculator({ manager_count: 0, store_count: 0, integrations: [] }, catalog, 'en').monthly, 0);
  assert.equal(resolveCalculator({ manager_count: 3, store_count: 1, integrations: [] }, { ua: calculatorSettings({ visible: false }) }, 'ua'), null);
  assert.equal(resolveCalculator({ manager_count: 3, store_count: 1, integrations: [] }, {}, 'ua'), null);
});

test('calculator details reach the Telegram message', () => {
  const message = buildTelegramMessage({
    ...normalizeAndValidateTrialRequest(request).data,
    requested_product: 'vortex',
    total_sum: 165,
    calculator: resolveCalculator({ manager_count: 4, store_count: 1, integrations: ['tecdoc', 'binotel', 'nova-poshta'] }, { ua: calculatorSettings() }, 'ua'),
    director_link: { kind: 'ticket', url: 'https://director.vortex-services.com/tickets#tc=456' },
  });
  assert.match(message, /Розрахована сума: \$165/);
  assert.match(message, /Менеджерів: 4, магазинів: 1/);
  assert.match(message, /Інтеграції: TecDoc \(\$25\/міс\.\), Binotel \(\$50 разово\), Nova Poshta \(\$20 разово\)/);
  assert.match(message, /Щомісяця: \$95, разово: \$70/);
  assert.match(message, /Тікет у Director: https:\/\/director\.vortex-services\.com\/tickets#tc=456/);
  assert.doesNotMatch(message, /Локація/);
});

test('phone limit counts one number across formats and expires', () => {
  let time = 0;
  const limiter = createPhoneLimiter({ windowMs: 1000, max: 3, now: () => time });
  limiter.record('+380 67 123 45 67');
  limiter.record('0671234567');
  assert.equal(limiter.isLimited('80671234567'), false);
  limiter.record('67 123 45 67');
  assert.equal(limiter.isLimited('+380671234567'), true);
  assert.equal(limiter.isLimited('+380501112233'), false);
  time = 1000;
  assert.equal(limiter.isLimited('+380671234567'), false);
});

test('Telegram message escapes CMS and visitor values so only our <b> tags are HTML', () => {
  const message = buildTelegramMessage({
    requested_product: 'vortex',
    name: 'Антон',
    phone: '+380 97 123 45 67',
    total_sum: 95,
    source_page: 'websites',
    website_package: 'custom',
    website_package_name: 'Сайт <Pro> & SEO',
    total_currency: 'USD',
  });
  assert.match(message, /Ім'я: <b>Антон<\/b>/);
  assert.match(message, /Пакет сайту: Сайт &lt;Pro&gt; &amp; SEO/);
  assert.doesNotMatch(message, /<Pro>/);
  const tecdoc = buildTelegramMessage({ requested_product: 'tecdoc', name: 'Антон', phone: '+380 97 123 45 67' });
  assert.match(tecdoc, /Ім'я: <b>Антон<\/b>, Номер телефону: <b>\+380 97 123 45 67<\/b>/);
});
