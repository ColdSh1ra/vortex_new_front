const { sendTelegramNotification } = require('../src/services/telegramService');

async function main() {
  await sendTelegramNotification('vortex', {
    name: 'Anton Best Developer ',
    phone: '+380951880392',
    total_sum: 1488,
    location: null,
  });

  console.log('Тестове сповіщення доставлено налаштованим одержувачам.');
}

main().catch((error) => {
  console.error('Не вдалося надіслати тестове сповіщення:', error.code || error.name);
  process.exitCode = 1;
});
