const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../data/vortex.json');
const sanitizeContentHtml = require('../src/security/sanitizeContent');

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]));
  }
  return value === null ? null : typeof value;
}

function strings(value, key = '') {
  if (typeof value === 'string') return [[key, value]];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([name, item]) => strings(item, `${key}.${name}`));
}

test('all five locales have complete matching structures and interpolation tokens', () => {
  assert.deepEqual(Object.keys(catalog).sort(), ['cz', 'en', 'pl', 'sk', 'ua']);
  for (const content of Object.values(catalog)) {
    assert.deepEqual(shape(content), shape(catalog.ua));
    for (const [key, source] of Object.entries(catalog.ua.ui)) {
      assert.ok(content.ui[key]);
      const tokens = (text) => [...text.matchAll(/\{\w+\}/g)].map(([token]) => token).sort();
      assert.deepEqual(tokens(content.ui[key]), tokens(source), key);
    }
  }
});

test('non-Ukrainian content has no untranslated Ukrainian text outside autonyms and URLs', () => {
  for (const [locale, content] of Object.entries(catalog)) {
    if (locale === 'ua') continue;
    for (const [key, value] of strings(content)) {
      if (key === '.ui.language.ua') continue;
      const visibleText = value.replace(/href="[^"]*"/g, '');
      assert.doesNotMatch(visibleText, /[А-Яа-яІіЇїЄєҐґ]/u, `${locale}${key}`);
    }
  }
});

test('all workshop screenshots and localized page sections are available', () => {
  for (const content of Object.values(catalog)) {
    assert.equal(content.car_service.blocks.length, 6);
    for (const block of content.car_service.blocks) {
      assert.ok(block.title && block.image_alt && block.paragraphs.length);
      assert.ok(fs.existsSync(path.join(__dirname, '../../client/public', block.image_src)));
    }
  }
});

test('FAQ and video HTML is sanitized independently in every locale', async () => {
  const unsafe = structuredClone(catalog);
  for (const content of Object.values(unsafe)) {
    content.FAQ[0].answer = '<p onclick="alert(1)">Safe<script>alert(1)</script></p>';
    content.videos[0].answer = '<a href="javascript:alert(1)">Video</a>';
  }
  const sanitized = await sanitizeContentHtml(unsafe);
  for (const content of Object.values(sanitized)) {
    assert.equal(content.FAQ[0].answer, '<p>Safe</p>');
    assert.equal(content.videos[0].answer, '<a>Video</a>');
  }
  assert.equal(sanitized.en.car_service.title, catalog.en.car_service.title);
});
