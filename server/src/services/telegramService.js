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
  source_page = 'home',
  language = 'ua',
  website_package,
}) {
  if (requested_product === 'tecdoc') {
    return `Нова заявка на ліцензію TecDoc\nІм'я: ${name}, Номер телефону: ${phone}`;
  }

  if (requested_product !== 'vortex') {
    const error = new Error('Unsupported product');
    error.code = 'UNSUPPORTED_PRODUCT';
    throw error;
  }

  const messageLines = [
    source_page === 'websites' ? 'Нова заявка на розробку сайту Vortex' : 'Нова заявка на тестову Vortex',
    `Сторінка: ${{ home: 'Головна', contact: 'Контакти', 'car-service': 'Облік СТО', websites: 'Розробка веб-сайтів', 'auto-dismantling': 'Автошрот' }[source_page] || source_page}`,
    `Мова: ${language}`,
    `Ім'я: <b>${name}</b>`,
    `Номер телефону: <b>${phone}</b>`,
    `Розрахована сума: $${formatMoney(total_sum)}`,
  ];

  if (website_package) {
    const packageName = { free: 'Безкоштовний', practical: 'Практичний', maximum: 'Максимальний' }[website_package];
    messageLines.push(`Пакет сайту: ${packageName}`);
  }

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

      const result = await response.json();

      if (!response.ok || !result.ok) {
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
