const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const PORT = process.env.PORT || 5001;
const VORTEX_DATA_PATH = path.join(__dirname, '..', '..', 'data', 'vortex.json');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '';
const RECAPTCHA_ALLOWED_HOSTNAMES = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || '')
  .split(',')
  .map((hostname) => hostname.trim().toLowerCase())
  .filter(Boolean);
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://localhost:5001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
// Director accepts site form submissions on the same API root as /content.
const DIRECTOR_SITE_API = (process.env.DIRECTOR_SITE_API || process.env.CMS_API_BASE_URL || '')
  .trim()
  .replace(/\/+$/, '');
// Server-only HMAC secret. Never expose it through VITE_* or write it to logs.
const DIRECTOR_FORM_SECRET = (process.env.DIRECTOR_FORM_SECRET || '').trim();
// Behind nginx every request comes from 127.0.0.1; set TRUST_PROXY=loopback so req.ip
// is the visitor's address (rate limits, reCAPTCHA). Empty = no proxy (local dev).
const TRUST_PROXY = (process.env.TRUST_PROXY || '').trim();

module.exports = {
  PORT,
  VORTEX_DATA_PATH,
  TELEGRAM_BOT_TOKEN,
  RECAPTCHA_SECRET_KEY,
  RECAPTCHA_ALLOWED_HOSTNAMES,
  CLIENT_ORIGINS,
  DIRECTOR_SITE_API,
  DIRECTOR_FORM_SECRET,
  TRUST_PROXY,
};
