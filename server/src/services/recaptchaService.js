const {
  RECAPTCHA_ALLOWED_HOSTNAMES,
  RECAPTCHA_SECRET_KEY,
} = require('../config/constants');

async function verifyRecaptcha(token, remoteIp) {
  if (!RECAPTCHA_SECRET_KEY) {
    const error = new Error('reCAPTCHA is not configured');
    error.code = 'RECAPTCHA_NOT_CONFIGURED';
    throw error;
  }

  const requestBody = new URLSearchParams({
    secret: RECAPTCHA_SECRET_KEY,
    response: token,
  });

  if (remoteIp) {
    requestBody.set('remoteip', remoteIp);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    if (!result.success) {
      return false;
    }

    if (RECAPTCHA_ALLOWED_HOSTNAMES.length > 0) {
      const hostname = String(result.hostname || '').toLowerCase();
      return RECAPTCHA_ALLOWED_HOSTNAMES.includes(hostname);
    }

    return true;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  verifyRecaptcha,
};
