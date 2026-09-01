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

module.exports = {
  PORT,
  VORTEX_DATA_PATH,
  TELEGRAM_BOT_TOKEN,
  RECAPTCHA_SECRET_KEY,
  RECAPTCHA_ALLOWED_HOSTNAMES,
  CLIENT_ORIGINS,
};
