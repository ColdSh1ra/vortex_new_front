const crypto = require('node:crypto');
const { DIRECTOR_SITE_API, DIRECTOR_FORM_SECRET } = require('../config/constants');

const COMMENT_MAX_LENGTH = 480;
const REQUEST_TIMEOUT_MS = 10000;
const DIRECTOR_APP_URL = 'https://director.vortex-services.com';
const SECRET_PATTERN = /^[0-9a-fA-F]{64}$/;
// These statuses mean our configuration or calling code is wrong, not the visitor's input.
const CONFIGURATION_ERROR_STATUSES = new Set([401, 403, 405, 413, 415]);
const SOURCE_PATHS = {
  home: '/',
  contact: '/contact',
  'car-service': '/car-service',
  websites: '/websites',
  'auto-dismantling': '/auto-dismantling',
  'tecdoc-license': '/tecdoc-license',
};

function maskPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  return digits ? `***${digits.slice(-4)}` : '***';
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAmount(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatMoney(value, currency) {
  const symbol = cleanText(currency);
  if (!symbol) return formatAmount(value);
  // ISO codes read naturally after the number, single symbols before it ($95, €25).
  return /^[A-Za-z]{3}$/.test(symbol) ? `${formatAmount(value)} ${symbol}` : `${symbol}${formatAmount(value)}`;
}

function formatIntegration(integration, currency) {
  const billing = integration.billing_period === 'monthly' ? '/міс.' : ' разово';
  return `${cleanText(integration.label)} (${formatMoney(integration.price, currency)}${billing})`;
}

function requestTitle({ requested_product, source_page }) {
  if (requested_product === 'tecdoc') return 'Ліцензія TecDoc';
  if (source_page === 'websites') return 'Розробка сайту';
  return 'Тестова версія Vortex';
}

function formatUtm(utm) {
  if (!utm) return '';
  const main = ['utm_source', 'utm_medium', 'utm_campaign'].map((key) => cleanText(utm[key]) || '-');
  const extra = ['utm_term', 'utm_content']
    .filter((key) => cleanText(utm[key]))
    .map((key) => `${key.slice(4)}=${cleanText(utm[key])}`);
  if (main.every((value) => value === '-') && extra.length === 0) return '';
  return [main.join(' / '), ...extra].join(', ');
}

function fitToLength(text, maxLength) {
  if (text.length <= maxLength) return text;
  let result = '';
  // Iterate by code point so a surrogate pair is never split.
  for (const character of text) {
    if (result.length + character.length > maxLength - 1) break;
    result += character;
  }
  return `${result.trimEnd()}…`;
}

/**
 * Builds the Director lead/ticket comment from server-verified data only.
 * Name and phone are intentionally absent: Director adds them to the ticket itself.
 * The result never exceeds 480 UTF-16 units, which also keeps it under 480 code points.
 */
function buildDirectorComment(data) {
  const lines = [
    `Заявка: ${requestTitle(data)}`,
    `Сторінка: ${cleanText(data.page_path) || SOURCE_PATHS[data.source_page] || '/'}`,
    `Мова сайту: ${cleanText(data.language) || 'ua'}`,
  ];

  if (data.calculator) {
    const { calculator } = data;
    lines.push(`Менеджерів: ${calculator.manager_count}, магазинів: ${calculator.store_count}`);
    lines.push(`Інтеграції: ${calculator.integrations.length
      ? calculator.integrations.map((integration) => formatIntegration(integration, calculator.currency)).join(', ')
      : 'немає'}`);
    const sum = [`${formatMoney(calculator.monthly, calculator.currency)}/міс.`];
    if (calculator.one_time > 0) sum.push(`${formatMoney(calculator.one_time, calculator.currency)} разово`);
    lines.push(`Сума: ${sum.join(' + ')}`);
  } else if (data.website_package) {
    const name = cleanText(data.website_package_name) || cleanText(data.website_package);
    const money = formatMoney(data.total_sum, data.total_currency);
    const price = data.billing_type === 'free' ? 'безкоштовно'
      : data.billing_type === 'monthly' ? `${money}/міс.` : `${money} разово`;
    lines.push(`Пакет сайту: ${name} (${price})`);
  } else if (data.tecdoc_license) {
    lines.push(`Ціна ліцензії: ${formatMoney(data.tecdoc_license.price, data.tecdoc_license.currency)}`);
  }

  const base = fitToLength(lines.join('\n'), COMMENT_MAX_LENGTH);
  const utm = formatUtm(data.utm);
  if (!utm) return base;

  // UTM is the least important line, so it is the one shortened to fit the limit.
  const room = COMMENT_MAX_LENGTH - base.length - '\nUTM: '.length;
  if (room < 8) return base;
  return `${base}\nUTM: ${fitToLength(utm, room)}`;
}

function signDirectorRequest(secret, timestamp, nonce, body) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}\n${nonce}\n${body}`).digest('hex');
}

function logOutcome(logger, result, phone) {
  const phoneTail = maskPhone(phone);
  if (result.ok) {
    logger.info(`Director form accepted: status=${result.status} lead_id=${result.lead_id} ticket_id=${result.ticket_id} phone=${phoneTail}`);
  } else if (result.skipped) {
    logger.warn(`Director skipped (${result.reason}), phone=${phoneTail}`);
  } else if (CONFIGURATION_ERROR_STATUSES.has(result.http_status)) {
    logger.error(`Director rejected the form request: http=${result.http_status} code=${result.reason}. Check the secret, server clock, IP allowlist or signing code. phone=${phoneTail}`);
  } else {
    const message = result.message ? ` message=${cleanText(result.message).slice(0, 300)}` : '';
    logger.warn(`Director form failed: http=${result.http_status ?? '-'} code=${result.reason}${message} phone=${phoneTail}`);
  }
}

/**
 * Sends one signed form submission to Director. Never throws and never retries:
 * a repeated visitor submit is a new request with a new nonce, and Director
 * deduplicates leads by phone.
 */
async function submitToDirector({ name, phone, comment }, options = {}) {
  const {
    apiBase = DIRECTOR_SITE_API,
    secret = DIRECTOR_FORM_SECRET,
    fetchImpl = (...args) => fetch(...args),
    now = Date.now,
    timeoutMs = REQUEST_TIMEOUT_MS,
    logger = console,
  } = options;

  let result;
  if (!apiBase || !secret) {
    result = { ok: false, skipped: true, reason: 'not_configured' };
  } else if (!SECRET_PATTERN.test(secret)) {
    result = { ok: false, skipped: true, reason: 'invalid_secret_format' };
  } else {
    result = await sendSigned({ name, phone, comment }, { apiBase, secret, fetchImpl, now, timeoutMs });
  }

  logOutcome(logger, result, phone);
  return result;
}

async function sendSigned({ name, phone, comment }, { apiBase, secret, fetchImpl, now, timeoutMs }) {
  // Serialize exactly once: the signed string must be byte-for-byte the request body.
  const body = JSON.stringify(comment ? { name, phone, comment } : { name, phone });
  const timestamp = Math.floor(now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const signature = signDirectorRequest(secret, timestamp, nonce, body);

  let response;
  try {
    response = await fetchImpl(`${apiBase}/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Site-Timestamp': timestamp,
        'X-Site-Nonce': nonce,
        'X-Site-Signature': signature,
      },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { ok: false, reason: 'network' };
  }

  const json = await response.json().catch(() => null);
  const data = json?.data;
  if (response.ok && data && (data.status === 'created' || data.status === 'commented')) {
    return {
      ok: true,
      status: data.status,
      lead_id: Number.isSafeInteger(data.lead_id) ? data.lead_id : null,
      ticket_id: Number.isSafeInteger(data.ticket_id) ? data.ticket_id : null,
    };
  }

  return {
    ok: false,
    http_status: response.status,
    reason: typeof json?.code === 'string' ? json.code : `http_${response.status}`,
    ...(typeof json?.message === 'string' ? { message: json.message } : {}),
  };
}

/** Link for staff notifications: the new ticket, or the existing lead for a repeat request. */
function directorLink(result) {
  if (!result?.ok) return null;
  if (result.status === 'created' && result.ticket_id !== null) {
    return { kind: 'ticket', url: `${DIRECTOR_APP_URL}/tickets#tc=${result.ticket_id}` };
  }
  if (result.lead_id !== null) {
    return { kind: result.status === 'commented' ? 'repeat' : 'lead', url: `${DIRECTOR_APP_URL}/leads#ld=${result.lead_id}` };
  }
  return null;
}

module.exports = {
  COMMENT_MAX_LENGTH,
  buildDirectorComment,
  directorLink,
  maskPhone,
  signDirectorRequest,
  submitToDirector,
};
