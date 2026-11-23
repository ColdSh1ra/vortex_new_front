// A site request must reach Telegram even when Director (and the CMS on the same API) is down.
// node --test runs each file in its own process, so these env values stay local to this file.
const test = require('node:test');
const assert = require('node:assert/strict');

process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
process.env.RECAPTCHA_ALLOWED_HOSTNAMES = '';
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
process.env.CMS_API_BASE_URL = 'https://cms.invalid/api';
process.env.DIRECTOR_SITE_API = 'https://director.invalid/api';
process.env.DIRECTOR_FORM_SECRET = 'a'.repeat(64);

const http = require('node:http');

const telegramMessages = [];
let directorCalls = 0;
const realFetch = global.fetch;
global.fetch = async (input, init = {}) => {
  const url = String(input);
  if (url.startsWith('http://127.0.0.1')) return realFetch(input, init);
  if (url.startsWith('https://www.google.com/recaptcha/')) {
    return Response.json({ success: true, hostname: 'localhost' });
  }
  if (url.startsWith('https://api.telegram.org/')) {
    const payload = JSON.parse(init.body);
    assert.equal(payload.parse_mode, 'HTML');
    telegramMessages.push(payload.text);
    return Response.json({ ok: true });
  }
  if (url.startsWith('https://director.invalid/')) {
    directorCalls += 1;
    return Response.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
  if (url.startsWith('https://cms.invalid/')) throw new TypeError('fetch failed');
  throw new Error(`Unexpected request in test: ${url}`);
};

const app = require('../src/app');

async function post(body) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/trial-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    server.close();
  }
}

const base = {
  requested_product: 'vortex',
  name: 'Тест Фолбек',
  total_sum: 300,
  recaptcha_token: 'test-token-not-sent-anywhere',
  elapsed_ms: 10000,
};

test('Director failure still delivers the request to Telegram with a warning', async () => {
  telegramMessages.length = 0;
  const callsBefore = directorCalls;
  const result = await post({ ...base, phone: '+380 50 000 00 01', source_page: 'contact' });
  assert.equal(result.status, 200);
  assert.equal(directorCalls, callsBefore + 1);
  assert.ok(telegramMessages.length > 0);
  for (const message of telegramMessages) {
    assert.match(message, /Тест Фолбек/);
    assert.match(message, /Director недоступний/);
  }
});

test('website package request reaches Telegram when the CMS and Director are down', async () => {
  telegramMessages.length = 0;
  const result = await post({ ...base, phone: '+380 50 000 00 02', source_page: 'websites', website_package: 'practical' });
  assert.equal(result.status, 200);
  assert.ok(telegramMessages.length > 0);
  for (const message of telegramMessages) {
    assert.match(message, /Пакет сайту: Практичний/);
    assert.match(message, /не перевірено: CMS недоступна/);
    assert.match(message, /Director недоступний/);
  }
});
