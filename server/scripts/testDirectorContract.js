/*
 * Checks the Director form API contract directly (section 6 of the Director spec),
 * with signed requests built from DIRECTOR_SITE_API and DIRECTOR_FORM_SECRET in server/.env.
 *
 *   npm run director:check                 against the dev host
 *   npm run director:check -- --allow-prod against any other host (creates a real lead)
 *
 * Every run uses a new test phone, so it creates one lead + one ticket; the links
 * are printed at the end so they can be removed in Director.
 */
const crypto = require('node:crypto');
const { DIRECTOR_SITE_API, DIRECTOR_FORM_SECRET } = require('../src/config/constants');
const { signDirectorRequest } = require('../src/services/directorService');

const allowProd = process.argv.includes('--allow-prod');
const out = (line = '') => process.stdout.write(`${line}\n`);

async function send(bodyText, { secret = DIRECTOR_FORM_SECRET, timestamp, nonce } = {}) {
  const ts = timestamp ?? Math.floor(Date.now() / 1000).toString();
  const id = nonce ?? crypto.randomBytes(16).toString('hex');
  const headers = {
    'Content-Type': 'application/json',
    'X-Site-Timestamp': ts,
    'X-Site-Nonce': id,
    'X-Site-Signature': signDirectorRequest(secret, ts, id, bodyText),
  };
  try {
    const response = await fetch(`${DIRECTOR_SITE_API}/forms/submit`, {
      method: 'POST', headers, body: bodyText, signal: AbortSignal.timeout(15000),
    });
    const json = await response.json().catch(() => null);
    return { status: response.status, json, ts, nonce: id };
  } catch (error) {
    return { status: 0, error: error.cause?.code || error.name, ts, nonce: id };
  }
}

const describe = (result) => (result.error
  ? `мережева помилка ${result.error}`
  : `HTTP ${result.status} ${JSON.stringify(result.json)}`);

async function main() {
  if (!DIRECTOR_SITE_API || !/^[0-9a-fA-F]{64}$/.test(DIRECTOR_FORM_SECRET)) {
    out('Заповніть у server/.env DIRECTOR_SITE_API і DIRECTOR_FORM_SECRET (64 hex-символи).');
    process.exitCode = 1;
    return;
  }
  if (!/\.dev\./.test(DIRECTOR_SITE_API) && !allowProd) {
    out(`${DIRECTOR_SITE_API} — не dev-хост. Перевірка створить тестовий лід і тікет у робочій CRM.`);
    out('Якщо це свідомо: npm run director:check -- --allow-prod');
    process.exitCode = 1;
    return;
  }

  const national = `99${String(crypto.randomInt(0, 10000000)).padStart(7, '0')}`;
  const name = 'Тест Інтеграції Сайту';
  const comment = 'Перевірка інтеграції сайту з Director (director:check). Можна видалити.';
  out(`Director: ${DIRECTOR_SITE_API}`);
  out(`Тестовий телефон: 0${national}\n`);

  let failed = 0;
  let leadId = null;
  let ticketId = null;
  const check = (title, ok, result) => {
    if (!ok) failed += 1;
    out(`${ok ? 'PASS' : 'FAIL'}  ${title}\n      ${describe(result)}`);
  };

  const created = await send(JSON.stringify({ name, phone: `+380 ${national}`, comment }));
  leadId = created.json?.data?.lead_id ?? null;
  ticketId = created.json?.data?.ticket_id ?? null;
  check('1. Нова заявка → 200 created, є lead_id і ticket_id', created.status === 200
    && created.json?.data?.status === 'created' && leadId !== null && ticketId !== null, created);

  const repeat = await send(JSON.stringify({ name, phone: `0${national}`, comment: `${comment} Повтор.` }));
  check('2. Той самий телефон в іншому записі → 200 commented, ticket_id null', repeat.status === 200
    && repeat.json?.data?.status === 'commented' && repeat.json?.data?.ticket_id === null, repeat);

  const wrongSecret = await send(JSON.stringify({ name, phone: `0${national}` }), { secret: 'b'.repeat(64) });
  check('3. Неправильний секрет → 401', wrongSecret.status === 401, wrongSecret);

  const replayBody = JSON.stringify({ name, phone: `0${national}`, comment: `${comment} Replay.` });
  const original = await send(replayBody);
  const replay = await send(replayBody, { timestamp: original.ts, nonce: original.nonce });
  check('4. Повтор тих самих заголовків і тіла → 401 на другій спробі', original.status === 200 && replay.status === 401, replay);

  const extra = await send(JSON.stringify({ name, phone: `0${national}`, email: 'test@example.com' }));
  check('5. Зайве поле в тілі → 400', extra.status === 400, extra);

  const tooLong = await send(JSON.stringify({ name, phone: `0${national}`, comment: 'х'.repeat(481) }));
  check('6. Коментар 481 символ → 400', tooLong.status === 400, tooLong);

  const maxLength = await send(JSON.stringify({ name, phone: `0${national}`, comment: 'х'.repeat(480) }));
  check('7. Коментар рівно 480 символів → 200', maxLength.status === 200, maxLength);

  out(`\nПеревірок: 7, з помилками: ${failed}`);
  if (leadId !== null) out(`Тестовий лід:  https://director.vortex-services.com/leads#ld=${leadId}`);
  if (ticketId !== null) out(`Тестовий тікет: https://director.vortex-services.com/tickets#tc=${ticketId}`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
