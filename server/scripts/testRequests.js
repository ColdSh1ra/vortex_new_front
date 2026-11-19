/*
 * Test site requests end to end: every scenario goes through the real Express
 * route POST /api/trial-request (validation, bot checks, limits, CMS pricing,
 * Director comment, Telegram text), started in-process on a random port.
 *
 *   npm run requests:list                    list scenarios and tags
 *   npm run requests:dry                     nothing leaves the machine: Telegram and
 *                                            Director are simulated, the output shows
 *                                            exactly what would be sent
 *   npm run requests:live                    real Telegram + real Director from server/.env
 *   npm run request:real                     one real request (Ascention night, $50/month,
 *                                            $0 one-time, no add-ons) to Telegram and Director
 *
 * Options (after `--`, e.g. `npm run requests:live -- --only=calculator`):
 *   --only=a,b     run scenarios whose id or tag matches
 *   --fresh        new test phone numbers, so Director creates new leads instead of
 *                  commenting on leads from an earlier run
 *   --quiet        one line per step, without the sent texts
 *   --use-cms      dry run with CMS_API_BASE_URL from .env instead of local data
 *   --allow-prod   allow --live against a Director host that is not the dev host
 *   --phone=...    phone for real-request (default: a +380 99 test number)
 *
 * Only reCAPTCHA is always stubbed (a real token needs a browser). This is a
 * local script: the production server never skips reCAPTCHA.
 */
const crypto = require('node:crypto');
const http = require('node:http');

const args = parseArgs(process.argv.slice(2));
const LIVE = Boolean(args.live);
const DRY_SECRET = crypto.randomBytes(32).toString('hex');
const DRY_DIRECTOR_API = 'http://director.dry-run/api';

// Must be set before the config module loads .env (dotenv never overrides set variables).
process.env.RECAPTCHA_SECRET_KEY = 'local-test-script';
if (!LIVE) {
  process.env.TELEGRAM_BOT_TOKEN = 'dry-run';
  process.env.DIRECTOR_SITE_API = DRY_DIRECTOR_API;
  process.env.DIRECTOR_FORM_SECRET = DRY_SECRET;
  if (!args['use-cms']) {
    process.env.CMS_API_BASE_URL = '';
    process.env.BLOG_API_BASE_URL = '';
  }
}

const constants = require('../src/config/constants');
const { signDirectorRequest } = require('../src/services/directorService');

const DIRECTOR_URL = `${constants.DIRECTOR_SITE_API}/forms/submit`;
const directorEnabled = Boolean(constants.DIRECTOR_SITE_API) && /^[0-9a-fA-F]{64}$/.test(constants.DIRECTOR_FORM_SECRET);
const telegramEnabled = Boolean(constants.TELEGRAM_BOT_TOKEN);
const out = (line = '') => process.stdout.write(`${line}\n`);

// ---------- outbound calls: recorded, and simulated in a dry run ----------

const realFetch = global.fetch;
let calls = [];
const jsonResponse = (status, json) => new Response(JSON.stringify(json), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

global.fetch = async (input, init = {}) => {
  const url = String(input);

  if (url.startsWith('https://www.google.com/recaptcha/')) {
    return jsonResponse(200, { success: true, hostname: constants.RECAPTCHA_ALLOWED_HOSTNAMES[0] || 'localhost' });
  }

  if (url.startsWith('https://api.telegram.org/')) {
    const call = { to: 'telegram', text: JSON.parse(init.body).text };
    calls.push(call);
    if (!LIVE) {
      call.ok = true;
      return jsonResponse(200, { ok: true, result: {} });
    }
    try {
      const response = await realFetch(input, init);
      call.ok = response.ok;
      call.http = response.status;
      return response;
    } catch (error) {
      call.ok = false;
      call.error = error.cause?.code || error.name;
      throw error;
    }
  }

  if (url === DIRECTOR_URL) {
    const call = { to: 'director', body: JSON.parse(init.body), signatureOk: signatureMatches(init) };
    calls.push(call);
    if (!LIVE) {
      const [status, json] = simulateDirector(init);
      call.http = status;
      call.response = json;
      return jsonResponse(status, json);
    }
    try {
      const response = await realFetch(input, init);
      call.http = response.status;
      call.response = await response.clone().json().catch(() => null);
      return response;
    } catch (error) {
      call.error = error.cause?.code || error.name;
      throw error;
    }
  }

  // CMS content and anything else go to the real network.
  return realFetch(input, init);
};

function signatureMatches(init) {
  const headers = init.headers;
  const expected = signDirectorRequest(
    constants.DIRECTOR_FORM_SECRET,
    headers['X-Site-Timestamp'],
    headers['X-Site-Nonce'],
    init.body,
  );
  return expected === headers['X-Site-Signature'];
}

// Dry-run model of Director, following the contract in the Director spec.
const simulatedLeads = new Map();
const seenNonces = new Set();
let simulatedLeadId = 100;
let simulatedTicketId = 500;

function simulateDirector(init) {
  const headers = init.headers;
  const timestamp = Number(headers['X-Site-Timestamp']);
  if (
    !signatureMatches(init)
    || seenNonces.has(headers['X-Site-Nonce'])
    || !/^[A-Za-z0-9_-]{16,64}$/.test(headers['X-Site-Nonce'])
    || Math.abs(Date.now() / 1000 - timestamp) > 300
  ) {
    return [401, { code: 'UNAUTHORIZED' }];
  }
  seenNonces.add(headers['X-Site-Nonce']);

  const invalid = (message) => [400, { code: 'INVALID_REQUEST', message }];
  let body;
  try {
    body = JSON.parse(init.body);
  } catch {
    return invalid('Тіло не JSON');
  }
  if (Object.keys(body).some((key) => !['name', 'phone', 'comment'].includes(key))) return invalid('Зайве поле');
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 128) return invalid('Неправильне ім\'я');
  if (body.comment !== undefined && (typeof body.comment !== 'string' || [...body.comment].length > 480)) {
    return invalid('Коментар довший за 480 символів');
  }

  const digits = String(body.phone ?? '').replace(/\D/g, '');
  let leadKey;
  if (/^(380|80|0)?\d{9}$/.test(digits)) leadKey = `0${digits.slice(-9)}`;
  else if (digits.length >= 10 && digits.length <= 12) leadKey = `+${digits}`;
  else return invalid('Неправильний телефон');

  if (simulatedLeads.has(leadKey)) {
    return [200, { data: { status: 'commented', lead_id: simulatedLeads.get(leadKey), ticket_id: null } }];
  }
  simulatedLeadId += 1;
  simulatedTicketId += 1;
  simulatedLeads.set(leadKey, simulatedLeadId);
  return [200, { data: { status: 'created', lead_id: simulatedLeadId, ticket_id: simulatedTicketId } }];
}

// ---------- scenarios ----------

const seed = args.fresh ? String(crypto.randomInt(0, 100000)).padStart(5, '0') : '00000';
let phoneIndex = 0;
// Test numbers +380 99 SSSSS NN: stable between runs unless --fresh.
const nextNumber = () => `99${seed}${String(++phoneIndex).padStart(2, '0')}`;
const phone = {
  intl: (n) => `+380 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7)}`,
  local: (n) => `0${n}`,
  code380: (n) => `380${n}`,
  code80: (n) => `80${n}`,
  bare: (n) => n,
};

function buildScenarios(catalog) {
  const calculatorSettings = catalog?.ua?.settings?.pricing_calculator;
  const integrations = calculatorSettings?.integrations?.map((item) => item.id) ?? ['tecdoc', 'binotel', 'nova-poshta'];
  const defaults = calculatorSettings?.integrations?.filter((item) => item.selected_by_default).map((item) => item.id)
    ?? ['binotel', 'nova-poshta'];
  const managers = calculatorSettings?.default_manager_count ?? 3;
  const stores = calculatorSettings?.default_store_count ?? 1;
  const websiteTariffs = catalog?.ua?.websites?.pricing?.tariffs?.filter((item) => item.visible !== false).map((item) => item.id)
    ?? ['free', 'practical', 'maximum'];

  const base = (overrides = {}) => ({
    requested_product: 'vortex',
    source_page: 'home',
    language: 'ua',
    name: 'Тест Сайт',
    phone: overrides.phone ?? phone.intl(nextNumber()),
    total_sum: 0,
    recaptcha_token: 'local-test-token',
    page_path: '/',
    elapsed_ms: 8000,
    company_site: '',
    ...overrides,
  });
  const calc = (managerCount, storeCount, ids, overrides = {}) => base({
    name: 'Тест Калькулятор',
    total_sum: 100,
    calculator: { manager_count: managerCount, store_count: storeCount, integrations: ids },
    ...overrides,
  });
  const delivered = { status: 200, delivered: true };
  const dropped = (status) => ({ status, delivered: false });
  const one = (id, tags, title, payload, expect = delivered, check) => ({ id, tags, title, steps: [{ payload, expect }], check });

  const scenarios = [
    one('calc-default', ['calculator'], 'Головна, калькулятор за замовчуванням',
      calc(managers, stores, defaults)),
    one('calc-all-integrations', ['calculator', 'utm'], 'Усі інтеграції, 5 менеджерів, 2 магазини, повний UTM',
      calc(5, 2, integrations, { utm: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'brand', utm_term: 'crm sto', utm_content: 'banner-1' } })),
    one('calc-no-integrations', ['calculator'], 'Без інтеграцій',
      calc(managers, stores, [])),
    one('calc-zero-counts', ['calculator'], '0 менеджерів і 0 магазинів (сума за місяць не менша за 0)',
      calc(0, 0, integrations.slice(0, 1))),
    one('calc-car-service', ['calculator', 'pages'], 'Сторінка СТО, мова sk',
      calc(4, 1, integrations.slice(0, 1), { source_page: 'car-service', page_path: '/car-service', language: 'sk' })),
    one('calc-tampered-total', ['calculator', 'security'], 'Браузер підмінив суму на 999999, сервер має перерахувати',
      calc(managers, stores, defaults, { total_sum: 999999 }), delivered,
      (step) => (step.telegram && /999999/.test(step.telegram.text) ? 'у Telegram потрапила сума від браузера' : null)),
    one('calc-unknown-integration', ['calculator', 'security'], 'Невідома інтеграція відкидається',
      calc(managers, stores, [...integrations.slice(0, 1), 'fake-addon']), delivered,
      (step) => (step.director && /fake-addon/.test(step.director.body.comment) ? 'невідома інтеграція потрапила в коментар' : null)),
    ...['en', 'pl', 'cz'].map((language) => one(`calc-lang-${language}`, ['calculator', 'languages'], `Калькулятор, мова ${language}`,
      calc(managers, stores, defaults, { language }))),

    one('contact', ['pages'], 'Сторінка контактів, без калькулятора',
      base({ source_page: 'contact', page_path: '/contact' })),
    one('auto-dismantling', ['pages'], 'Сторінка автошроту, без калькулятора',
      base({ source_page: 'auto-dismantling', page_path: '/auto-dismantling' })),
    ...websiteTariffs.map((id) => one(`websites-${id}`, ['pages', 'websites'], `Розробка сайту, пакет ${id}`,
      base({ source_page: 'websites', page_path: '/websites', website_package: id }))),
    one('tecdoc-license', ['pages', 'tecdoc'], 'Ліцензія TecDoc',
      base({ requested_product: 'tecdoc', source_page: 'tecdoc-license', page_path: '/tecdoc-license' })),

    one('phone-local-0', ['phones'], 'Телефон у форматі 0XXXXXXXXX', base({ phone: phone.local(nextNumber()) })),
    one('phone-380', ['phones'], 'Телефон у форматі 380XXXXXXXXX', base({ phone: phone.code380(nextNumber()) })),
    one('phone-80', ['phones'], 'Телефон у форматі 80XXXXXXXXX', base({ phone: phone.code80(nextNumber()) })),
    one('phone-9-digits', ['phones'], 'Телефон з 9 цифр без коду', base({ phone: phone.bare(nextNumber()) })),
    one('phone-foreign', ['phones'], 'Іноземний номер (+420)', base({ phone: `+420 7${seed} ${String(++phoneIndex).padStart(2, '0')}` })),
    (() => {
      const number = nextNumber();
      return {
        id: 'repeat-request',
        tags: ['phones', 'director'],
        title: 'Повторна заявка: той самий номер в іншому записі → лід отримує коментар',
        steps: [
          { payload: calc(managers, stores, defaults, { phone: phone.local(number) }), expect: { ...delivered, directorStatus: 'created' } },
          { payload: calc(managers, stores, integrations, { phone: phone.intl(number) }), expect: { ...delivered, directorStatus: 'commented' } },
        ],
      };
    })(),

    one('utm-partial', ['utm'], 'Лише utm_source', calc(managers, stores, defaults, { utm: { utm_source: 'facebook' } })),
    one('utm-long', ['utm'], 'Довгі UTM: коментар обрізається до 480 символів',
      calc(5, 2, integrations, { utm: Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].map((key) => [key, `${key}-`.padEnd(100, 'x')])) })),
    one('utm-invalid', ['utm'], 'Неправильний UTM відкидається, заявка проходить',
      calc(managers, stores, defaults, { utm: { utm_source: 'google', gclid: 'abc' } })),
    one('legacy-location', ['compat'], 'Стара вкладка з полем location приймається',
      base({ location: { latitude: 50.45, longitude: 30.52 } })),

    one('bot-honeypot', ['bots'], 'Заповнене поле-пастка: успіх для бота, нічого не надсилається',
      base({ company_site: 'https://spam.example' }), dropped(200)),
    one('bot-too-fast', ['bots'], 'Форму надіслано за 0,5 с: успіх для бота, нічого не надсилається',
      base({ elapsed_ms: 500 }), dropped(200)),

    one('invalid-phone', ['invalid'], 'Неправильний телефон → 400', base({ phone: '12-34' }), dropped(400)),
    one('invalid-name', ['invalid'], 'Неправильне ім\'я → 400', base({ name: '1' }), dropped(400)),
    one('invalid-extra-field', ['invalid'], 'Зайве поле → 400', base({ email: 'x@example.com' }), dropped(400)),
    one('invalid-calculator-tecdoc', ['invalid'], 'Калькулятор у заявці TecDoc → 400',
      base({ requested_product: 'tecdoc', source_page: 'tecdoc-license', calculator: { manager_count: 1, store_count: 1, integrations: [] } }), dropped(400)),

    (() => {
      const number = nextNumber();
      const step = (format) => ({ payload: base({ phone: format(number) }), expect: delivered });
      return {
        id: 'phone-limit',
        tags: ['limits'],
        title: 'Ліміт: 4-та заявка з одного номера за добу → 429',
        steps: [step(phone.intl), step(phone.local), step(phone.code380), { payload: base({ phone: phone.code80(number) }), expect: dropped(429) }],
      };
    })(),

    // Manual: runs only when named exactly (npm run request:real), never in a full run.
    {
      id: 'real-request',
      tags: [],
      manual: true,
      requireDirector: true,
      title: 'Справжня заявка: Ascention night, $50/міс., $0 разово, без додаткових послуг',
      steps: [{
        // Default manager/store counts and no add-ons: the monthly price is the CMS base price.
        payload: calc(managers, stores, [], {
          name: 'Ascention night',
          phone: typeof args.phone === 'string' ? args.phone : phone.intl(nextNumber()),
          total_sum: 50,
        }),
        expect: delivered,
      }],
      check: (step) => {
        if (step.telegram && !step.telegram.text.includes('Щомісяця: $50, разово: $0')) {
          return 'у Telegram не $50/міс. і $0 разово: перевірте base_monthly_price у CMS';
        }
        if (step.director && !/Інтеграції: немає\nСума: \$50\/міс\.(\n|$)/.test(step.director.body.comment)) {
          return 'у коментарі Director не "$50/міс." без додаткових послуг';
        }
        return null;
      },
    },
  ];
  return scenarios;
}

// ---------- running ----------

let ipCounter = 0;
function post(port, payload) {
  // A new loopback source address per request keeps the per-IP limit out of the way.
  ipCounter = (ipCounter % 250) + 1;
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: '127.0.0.1',
      localAddress: `127.0.0.${ipCounter + 1}`,
      port,
      path: '/api/trial-request',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (response) => {
      let text = '';
      response.on('data', (chunk) => { text += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body: text }));
    });
    request.on('error', reject);
    request.end(data);
  });
}

async function runStep(port, payload) {
  calls = [];
  const logs = [];
  const original = { info: console.info, warn: console.warn, error: console.error, log: console.log };
  for (const level of Object.keys(original)) console[level] = (...parts) => logs.push(`${level}: ${parts.join(' ')}`);
  let response;
  try {
    response = await post(port, payload);
  } finally {
    Object.assign(console, original);
  }
  return {
    ...response,
    logs,
    director: calls.find((call) => call.to === 'director'),
    telegram: calls.find((call) => call.to === 'telegram'),
  };
}

function evaluate(step, expect) {
  const problems = [];
  if (step.status !== expect.status) problems.push(`очікували HTTP ${expect.status}, отримали ${step.status}`);
  if (directorEnabled && Boolean(step.director) !== expect.delivered) {
    problems.push(expect.delivered ? 'заявка не пішла в Director' : 'заявка не мала йти в Director');
  }
  if (telegramEnabled && Boolean(step.telegram) !== expect.delivered) {
    problems.push(expect.delivered ? 'заявка не пішла в Telegram' : 'заявка не мала йти в Telegram');
  }
  if (step.director) {
    const { body } = step.director;
    if (!step.director.signatureOk) problems.push('підпис Director не збігається');
    if (Object.keys(body).some((key) => !['name', 'phone', 'comment'].includes(key))) problems.push('зайве поле в тілі Director');
    if (body.comment && body.comment.length > 480) problems.push(`коментар ${body.comment.length} символів (> 480)`);
    const status = step.director.response?.data?.status;
    // Lead status is only predictable when the numbers are new to Director.
    if (expect.directorStatus && (!LIVE || args.fresh) && status && status !== expect.directorStatus) {
      problems.push(`Director відповів ${status}, очікували ${expect.directorStatus}`);
    }
  }
  if (step.telegram && step.telegram.ok === false) problems.push('Telegram не прийняв повідомлення');
  return problems;
}

function describeDirector(call) {
  if (!call) return directorEnabled ? 'не надсилався' : 'вимкнено (немає DIRECTOR_FORM_SECRET)';
  if (call.error) return `мережева помилка ${call.error}`;
  const data = call.response?.data;
  if (data) return `${data.status}, lead ${data.lead_id}, ticket ${data.ticket_id}`;
  return `HTTP ${call.http} ${call.response?.code ?? ''}${call.response?.message ? ` (${call.response.message})` : ''}`.trim();
}

function describeTelegram(call) {
  if (!call) return telegramEnabled ? 'не надсилався' : 'вимкнено (немає TELEGRAM_BOT_TOKEN)';
  if (call.error) return `помилка ${call.error}`;
  return call.ok ? (LIVE ? 'надіслано' : 'симуляція') : `помилка HTTP ${call.http}`;
}

const indent = (text) => text.split('\n').map((line) => `        │ ${line}`).join('\n');

async function main() {
  const cms = require('../src/services/cmsService');
  let catalog = null;
  try {
    catalog = (await cms.snapshot()).content;
  } catch (error) {
    out(`! CMS недоступна (${error.code || error.name}): сценарії беруть типові id, ціни з калькулятора не перерахуються.`);
  }

  const all = buildScenarios(catalog);
  if (args.list) {
    for (const scenario of all) {
      const tags = scenario.manual ? 'лише окремо' : scenario.tags.join(', ');
      out(`${scenario.id.padEnd(28)} [${tags}]  ${scenario.title}`);
    }
    out(`\nТеги: ${[...new Set(all.flatMap((scenario) => scenario.tags))].join(', ')}`);
    return;
  }

  const filters = typeof args.only === 'string' ? args.only.split(',').map((item) => item.trim()).filter(Boolean) : [];
  // Manual scenarios run only when named by id, never through a tag or a full run.
  const selected = filters.length
    ? all.filter((scenario) => filters.some((filter) => scenario.id === filter || (!scenario.manual && scenario.tags.includes(filter))))
    : all.filter((scenario) => !scenario.manual);
  if (!selected.length) {
    out(`Немає сценаріїв для --only=${args.only}. Список: npm run requests:list`);
    process.exitCode = 1;
    return;
  }

  out(`Режим: ${LIVE ? 'LIVE — справжні Telegram і Director' : 'DRY — нічого не надсилається, Telegram і Director симулюються'}`);
  out(`Director: ${directorEnabled ? constants.DIRECTOR_SITE_API.replace(DRY_DIRECTOR_API, 'симуляція') : 'вимкнено (немає DIRECTOR_FORM_SECRET або DIRECTOR_SITE_API)'}`);
  out(`Telegram: ${telegramEnabled ? (LIVE ? 'увімкнено' : 'симуляція') : 'вимкнено (немає TELEGRAM_BOT_TOKEN)'}`);
  out(`Контент: ${process.env.CMS_API_BASE_URL ? `CMS ${process.env.CMS_API_BASE_URL}` : 'локальний server/data/vortex.json'}`);
  out(`Телефони: +380 99 ${seed}NN${args.fresh ? ' (нові)' : ' (ті самі, що в минулих запусках; --fresh для нових)'}`);

  if (LIVE) {
    if (directorEnabled && !/\.dev\./.test(constants.DIRECTOR_SITE_API) && !args['allow-prod']) {
      out('\nDIRECTOR_SITE_API вказує не на dev-хост. Тестові заявки створять ліди й тікети в робочій CRM.');
      out('Якщо це свідомо, запустіть ще раз з --allow-prod, наприклад: npm run requests:live -- --allow-prod --only=calc-default');
      process.exitCode = 1;
      return;
    }
    const needsDirector = selected.filter((scenario) => scenario.requireDirector).map((scenario) => scenario.id);
    if (needsDirector.length && (!directorEnabled || !telegramEnabled)) {
      out(`\n${needsDirector.join(', ')}: заявка має прийти і в Telegram, і в Director, тому нічого не надіслано.`);
      if (!directorEnabled) out('Заповніть DIRECTOR_FORM_SECRET (64 hex-символи) і DIRECTOR_SITE_API у server/.env.');
      if (!telegramEnabled) out('Заповніть TELEGRAM_BOT_TOKEN у server/.env.');
      process.exitCode = 1;
      return;
    }
    const sends = selected.flatMap((scenario) => scenario.steps).filter((step) => step.expect.delivered).length;
    out(`Буде надіслано заявок: ${sends}`);
  }

  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  let failed = 0;
  let stepCount = 0;
  try {
    for (const scenario of selected) {
      out(`\n■ ${scenario.id} — ${scenario.title}`);
      for (const [index, { payload, expect }] of scenario.steps.entries()) {
        stepCount += 1;
        const step = await runStep(port, payload);
        const problems = evaluate(step, expect);
        const extra = scenario.check?.(step);
        if (extra) problems.push(extra);
        if (problems.length) failed += 1;

        const label = scenario.steps.length > 1 ? ` крок ${index + 1}/${scenario.steps.length}` : '';
        out(`  ${problems.length ? 'FAIL' : 'PASS'}${label} · тел. ${payload.phone} · HTTP ${step.status} · Director: ${describeDirector(step.director)} · Telegram: ${describeTelegram(step.telegram)}`);
        for (const problem of problems) out(`    ✗ ${problem}`);
        if (args.quiet) continue;
        if (step.director) out(`    Коментар у Director (${step.director.body.comment?.length ?? 0}/480):\n${indent(step.director.body.comment ?? '(без коментаря)')}`);
        if (step.telegram) out(`    Telegram:\n${indent(step.telegram.text)}`);
        if (!step.director && !step.telegram) out(`    Відповідь: ${step.body}`);
        for (const line of step.logs) out(`    лог сервера → ${line}`);
      }
    }
  } finally {
    server.close();
  }

  out(`\nКроків: ${stepCount}, успішних: ${stepCount - failed}, з помилками: ${failed}`);
  if (failed) process.exitCode = 1;
}

function parseArgs(list) {
  const result = {};
  for (const item of list) {
    const match = /^--([^=]+)(?:=(.*))?$/.exec(item);
    if (match) result[match[1]] = match[2] ?? true;
  }
  return result;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
