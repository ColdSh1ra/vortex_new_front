const telegramRecipients = require('../config/telegramRecipients');
const { TELEGRAM_BOT_TOKEN } = require('../config/constants');

function formatMoney(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

// Messages are sent with parse_mode HTML: every value from a visitor or the CMS is escaped,
// so only the <b> tags written here are markup.
function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function directorLines(link, failed = false) {
  if (failed) return ['⚠️ Director недоступний: заявку не збережено в Director, внесіть її вручну.'];
  if (!link) return [];
  const label = { ticket: 'Тікет у Director', lead: 'Лід у Director', repeat: 'Повторна заявка, лід у Director' }[link.kind];
  return [`${label}: ${escapeHtml(link.url)}`];
}

function buildTelegramMessage({
  requested_product,
  name,
  phone,
  total_sum,
  calculator,
  director_link,
  director_failed = false,
  price_unverified = false,
  source_page = 'home',
  language = 'ua',
  website_package,
  website_package_name,
  total_currency,
  billing_type,
  content_revision,
}) {
  if (requested_product === 'tecdoc') {
    return [
      `Нова заявка на ліцензію TecDoc\nІм'я: <b>${escapeHtml(name)}</b>, Номер телефону: <b>${escapeHtml(phone)}</b>`,
      ...directorLines(director_link, director_failed),
    ].join('\n');
  }

  if (requested_product !== 'vortex') {
    const error = new Error('Unsupported product');
    error.code = 'UNSUPPORTED_PRODUCT';
    throw error;
  }

  const messageLines = [
    source_page === 'websites' ? 'Нова заявка на розробку сайту Vortex' : 'Нова заявка на тестову Vortex',
    `Сторінка: ${{ home: 'Головна', contact: 'Контакти', 'car-service': 'Облік СТО', websites: 'Розробка веб-сайтів', 'auto-dismantling': 'Автошрот' }[source_page] || escapeHtml(source_page)}`,
    `Мова: ${escapeHtml(language)}`,
    `Ім'я: <b>${escapeHtml(name)}</b>`,
    `Номер телефону: <b>${escapeHtml(phone)}</b>`,
    `Розрахована сума: ${escapeHtml(total_currency ? `${total_currency} ` : calculator?.currency || '$')}${formatMoney(total_sum)}${price_unverified ? ' (не перевірено: CMS недоступна)' : ''}`,
  ];

  if (website_package) {
    const packageName = { free: 'Безкоштовний', practical: 'Практичний', maximum: 'Максимальний' }[website_package];
    messageLines.push(`Пакет сайту: ${escapeHtml(website_package_name || packageName || website_package)}`);
    if (billing_type) messageLines.push(`Тип оплати: ${escapeHtml(billing_type)}`);
    if (content_revision !== undefined) messageLines.push(`Ревізія контенту: ${escapeHtml(content_revision)}`);
  }

  if (calculator) {
    const currency = escapeHtml(calculator.currency || '$');
    const integrations = calculator.integrations
      .map(({ label, price, billing_period }) => `${escapeHtml(label)} (${currency}${formatMoney(price)}${billing_period === 'monthly' ? '/міс.' : ' разово'})`)
      .join(', ');
    messageLines.push(`Менеджерів: ${calculator.manager_count}, магазинів: ${calculator.store_count}`);
    messageLines.push(`Інтеграції: ${integrations || 'немає'}`);
    messageLines.push(`Щомісяця: ${currency}${formatMoney(calculator.monthly)}, разово: ${currency}${formatMoney(calculator.one_time)}`);
  }

  messageLines.push(...directorLines(director_link, director_failed));
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

  const results = await Promise.allSettled(telegramRecipients.map(async ({ telegram_id, tg_tag }) => {
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
          parse_mode: 'HTML',
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

  // One recipient who blocked the bot must not fail the request for everyone else.
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length === results.length) throw failed[0].reason;
  if (failed.length > 0) {
    console.error(`Telegram delivery failed for ${failed.length} of ${results.length} recipients:`,
      failed.map((result) => result.reason?.message).join('; '));
  }
}

module.exports = {
  buildTelegramMessage,
  escapeHtml,
  sendTelegramNotification,
};
