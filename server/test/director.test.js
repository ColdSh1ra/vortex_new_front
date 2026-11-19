const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {
  COMMENT_MAX_LENGTH,
  buildDirectorComment,
  directorLink,
  maskPhone,
  submitToDirector,
} = require('../src/services/directorService');

const SECRET = 'a'.repeat(64);
const API = 'https://director.test/api';
const silent = { info() {}, warn() {}, error() {} };

function recordingLogger() {
  const lines = [];
  const push = (level) => (message) => lines.push({ level, message });
  return { lines, info: push('info'), warn: push('warn'), error: push('error') };
}

function fakeFetch(status, json) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (json === undefined) throw new SyntaxError('not json');
        return json;
      },
    };
  };
  return { calls, impl };
}

const calculatorRequest = {
  requested_product: 'vortex',
  source_page: 'car-service',
  page_path: '/car-service',
  language: 'ua',
  total_sum: 165,
  calculator: {
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
  },
  utm: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'brand' },
};

test('signs exactly the body it sends, with a fresh nonce per request', async () => {
  const { calls, impl } = fakeFetch(200, { data: { status: 'created', lead_id: 123, ticket_id: 456 } });
  const options = { apiBase: API, secret: SECRET, fetchImpl: impl, now: () => 1763550000000, logger: silent };
  const payload = { name: 'Іван', phone: '+380 67 123 45 67', comment: 'Тариф: Pro\nМова сайту: ua' };

  const first = await submitToDirector(payload, options);
  await submitToDirector(payload, options);

  assert.deepEqual(first, { ok: true, status: 'created', lead_id: 123, ticket_id: 456 });
  const [{ url, init }, second] = calls;
  assert.equal(url, `${API}/forms/submit`);
  assert.equal(init.method, 'POST');
  assert.equal(typeof init.body, 'string');
  assert.deepEqual(Object.keys(JSON.parse(init.body)), ['name', 'phone', 'comment']);
  assert.equal(init.headers['Content-Type'], 'application/json');
  assert.equal(init.headers['X-Site-Timestamp'], '1763550000');
  assert.match(init.headers['X-Site-Nonce'], /^[A-Za-z0-9_-]{16,64}$/);
  const expected = crypto.createHmac('sha256', SECRET)
    .update(`${init.headers['X-Site-Timestamp']}\n${init.headers['X-Site-Nonce']}\n${init.body}`)
    .digest('hex');
  assert.equal(init.headers['X-Site-Signature'], expected);
  assert.match(init.headers['X-Site-Signature'], /^[0-9a-f]{64}$/);
  assert.notEqual(second.init.headers['X-Site-Nonce'], init.headers['X-Site-Nonce']);
});

test('omits an empty comment so only allowed keys reach Director', async () => {
  const { calls, impl } = fakeFetch(200, { data: { status: 'commented', lead_id: 7, ticket_id: null } });
  const result = await submitToDirector({ name: 'Іван', phone: '0671234567', comment: '' }, { apiBase: API, secret: SECRET, fetchImpl: impl, logger: silent });
  assert.deepEqual(JSON.parse(calls[0].init.body), { name: 'Іван', phone: '0671234567' });
  assert.deepEqual(result, { ok: true, status: 'commented', lead_id: 7, ticket_id: null });
});

test('skips the call without configuration and never throws on failures', async () => {
  const { calls, impl } = fakeFetch(200, {});
  const payload = { name: 'Іван', phone: '0671234567' };
  assert.equal((await submitToDirector(payload, { apiBase: API, secret: '', fetchImpl: impl, logger: silent })).skipped, true);
  assert.equal((await submitToDirector(payload, { apiBase: '', secret: SECRET, fetchImpl: impl, logger: silent })).skipped, true);
  assert.equal((await submitToDirector(payload, { apiBase: API, secret: 'short', fetchImpl: impl, logger: silent })).reason, 'invalid_secret_format');
  assert.equal(calls.length, 0);

  const network = await submitToDirector(payload, {
    apiBase: API, secret: SECRET, logger: silent, fetchImpl: async () => { throw new Error('timeout'); },
  });
  assert.deepEqual(network, { ok: false, reason: 'network' });

  const badGateway = await submitToDirector(payload, { apiBase: API, secret: SECRET, fetchImpl: fakeFetch(502).impl, logger: silent });
  assert.deepEqual(badGateway, { ok: false, http_status: 502, reason: 'http_502' });
});

test('logs configuration errors as errors, without the full phone or the secret', async () => {
  const logger = recordingLogger();
  const result = await submitToDirector(
    { name: 'Іван', phone: '+380 67 123 45 67' },
    { apiBase: API, secret: SECRET, fetchImpl: fakeFetch(401, { code: 'UNAUTHORIZED' }).impl, logger },
  );
  assert.deepEqual(result, { ok: false, http_status: 401, reason: 'UNAUTHORIZED' });
  assert.equal(logger.lines[0].level, 'error');
  assert.match(logger.lines[0].message, /\*\*\*4567/);
  assert.doesNotMatch(logger.lines[0].message, /123 45 67|0671234567|Іван/);
  assert.doesNotMatch(logger.lines[0].message, new RegExp(SECRET));

  const invalid = recordingLogger();
  const rejected = await submitToDirector(
    { name: 'Іван', phone: '0671234567' },
    { apiBase: API, secret: SECRET, fetchImpl: fakeFetch(400, { code: 'INVALID_REQUEST', message: 'Невірний телефон' }).impl, logger: invalid },
  );
  assert.equal(rejected.message, 'Невірний телефон');
  assert.equal(invalid.lines[0].level, 'warn');
});

test('comment carries calculator choices from verified data, one value per line', () => {
  const comment = buildDirectorComment(calculatorRequest);
  assert.equal(comment, [
    'Заявка: Тестова версія Vortex',
    'Сторінка: /car-service',
    'Мова сайту: ua',
    'Менеджерів: 4, магазинів: 1',
    'Інтеграції: TecDoc ($25/міс.), Binotel ($50 разово), Нова пошта ($20 разово)',
    'Сума: $95/міс. + $70 разово',
    'UTM: google / cpc / brand',
  ].join('\n'));
});

test('comment covers website packages, TecDoc licenses and requests without extras', () => {
  assert.match(buildDirectorComment({
    requested_product: 'vortex', source_page: 'websites', language: 'en', website_package: 'practical',
    website_package_name: 'Практичний', total_sum: 300, total_currency: 'USD', billing_type: 'one_time',
  }), /^Заявка: Розробка сайту\nСторінка: \/websites\nМова сайту: en\nПакет сайту: Практичний \(300 USD разово\)$/);
  assert.match(buildDirectorComment({
    requested_product: 'tecdoc', source_page: 'tecdoc-license', language: 'ua', tecdoc_license: { price: 25, currency: '€' },
  }), /Заявка: Ліцензія TecDoc\n.*\n.*\nЦіна ліцензії: €25$/);
  assert.equal(
    buildDirectorComment({ requested_product: 'vortex', source_page: 'contact', language: 'pl' }),
    'Заявка: Тестова версія Vortex\nСторінка: /contact\nМова сайту: pl',
  );
});

test('comment never exceeds 480 characters and strips control characters', () => {
  const long = 'x'.repeat(100);
  const comment = buildDirectorComment({
    ...calculatorRequest,
    utm: { utm_source: long, utm_medium: long, utm_campaign: long, utm_term: long, utm_content: `${long}\u0007` },
    calculator: {
      ...calculatorRequest.calculator,
      integrations: Array.from({ length: 8 }, (_, index) => ({ id: `i${index}`, label: `Інтеграція\t${index} 😀`, price: 10, billing_period: 'monthly' })),
    },
  });
  assert.ok(comment.length <= COMMENT_MAX_LENGTH, `length ${comment.length}`);
  assert.ok([...comment].length <= COMMENT_MAX_LENGTH);
  assert.doesNotMatch(comment, /[\u0000-\u0009\u000B-\u001F\u007F]/);
  assert.match(comment, /^Заявка: Тестова версія Vortex/);
});

test('staff links point to the new ticket or to the existing lead', () => {
  assert.deepEqual(directorLink({ ok: true, status: 'created', lead_id: 1, ticket_id: 456 }), {
    kind: 'ticket', url: 'https://director.vortex-services.com/tickets#tc=456',
  });
  assert.deepEqual(directorLink({ ok: true, status: 'commented', lead_id: 123, ticket_id: null }), {
    kind: 'repeat', url: 'https://director.vortex-services.com/leads#ld=123',
  });
  assert.equal(directorLink({ ok: false, reason: 'network' }), null);
  assert.equal(maskPhone('+380 67 123 45 67'), '***4567');
});
