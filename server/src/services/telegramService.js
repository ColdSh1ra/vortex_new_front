const telegramRecipients = require('../config/telegramRecipients');
const { TELEGRAM_BOT_TOKEN } = require('../config/constants');

function formatMoney(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function buildTelegramMessage({
  requested_product,
  name,
  phone,
  total_sum,
  location,
}) {
  if (requested_product === 'tecdoc') {
    const error = new Error('TecDoc requests are not implemented yet');
    error.code = 'PRODUCT_NOT_IMPLEMENTED';
    throw error;
  }

  if (requested_product !== 'vortex') {
    const error = new Error('Unsupported product');
    error.code = 'UNSUPPORTED_PRODUCT';
    throw error;
  }

  const messageLines = [
    'Нова заявка на тестову Vortex',
    `Ім'я: ${name}`,
    `Номер телефону: ${phone}`,
    `Розрахована сума: $${formatMoney(total_sum)}`,
  ];

  if (location) {
    const latitude = location.latitude.toFixed(6);
    const longitude = location.longitude.toFixed(6);
    messageLines.push(`Локація: https://maps.google.com/?q=${latitude},${longitude}`);
  }

  return messageLines.join('\n');
}

async function sendTelegramNotification(requested_product, requestData) {
  const message = buildTelegramMessage({
    requested_product,
    ...requestData,
  });

  if (!TELEGRAM_BOT_TOKEN) {
    const error = new Error('Telegram bot is not configured');
    error.code = 'TELEGRAM_NOT_CONFIGURED';
    throw error;
  }

  const endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  await Promise.all(telegramRecipients.map(async ({ telegram_id, tg_tag }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: message,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`Telegram delivery failed for ${tg_tag}`);
        error.code = 'TELEGRAM_DELIVERY_FAILED';
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }
  }));
}

module.exports = {
  buildTelegramMessage,
  sendTelegramNotification,
};
