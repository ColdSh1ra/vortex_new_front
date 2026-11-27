// Personal chats that receive website requests. Each person must have pressed /start
// in the bot once, otherwise Telegram rejects messages to them.
const telegramIds = [
  8295980678,
  284488491,
  660307737,
  407194819,
  253632031,
  492998522,
  431716966,
  585638931,
  1588370298,
  592627152,
  5324186063,
  438667327,
  646297502,
];

const telegramRecipients = Object.freeze(
  telegramIds.map((telegram_id) => Object.freeze({
    telegram_id,
    tg_tag: telegram_id === 660307737 ? 'owner' : String(telegram_id),
  })),
);

module.exports = telegramRecipients;
