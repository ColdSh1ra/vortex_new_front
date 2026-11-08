const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAndValidateTrialRequest } = require('../src/controllers/trialRequestController');
const { buildTelegramMessage } = require('../src/services/telegramService');

const request = {
  requested_product: 'vortex',
  name: '  Антон   Васильєв ',
  phone: '+380 97 123 45 67',
  total_sum: 120,
  recaptcha_token: 'test-token-not-sent-anywhere',
  location: null,
  source_page: 'car-service',
  language: 'sk',
};

test('workshop source and selected language reach the notification', () => {
  const result = normalizeAndValidateTrialRequest(request);
  assert.equal(result.valid, true);
  assert.equal(result.data.name, 'Антон Васильєв');
  const message = buildTelegramMessage(result.data);
  assert.match(message, /Сторінка: Облік СТО/);
  assert.match(message, /Мова: sk/);
  assert.match(message, /Розрахована сума: \$120/);
});

test('accepts each supported source and locale and rejects untrusted metadata', () => {
  for (const source_page of ['home', 'contact', 'car-service']) {
    for (const language of ['ua', 'cz', 'sk', 'en', 'pl']) {
      assert.equal(normalizeAndValidateTrialRequest({ ...request, source_page, language }).valid, true);
    }
  }
  for (const source_page of ['', '/car-service', '<script>', 'other']) {
    assert.equal(normalizeAndValidateTrialRequest({ ...request, source_page }).valid, false);
  }
  assert.equal(normalizeAndValidateTrialRequest({ ...request, language: 'de' }).valid, false);
  assert.equal(normalizeAndValidateTrialRequest({ ...request, extra: true }).valid, false);
});

test('older request clients keep default source and language', () => {
  const { source_page, language, ...legacy } = request;
  const result = normalizeAndValidateTrialRequest(legacy);
  assert.equal(result.valid, true);
  assert.equal(result.data.source_page, 'home');
  assert.equal(result.data.language, 'ua');
});
