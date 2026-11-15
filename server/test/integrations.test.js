const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../data/vortex.json');

const slugs = ['tecdoc', 'checkbox', 'vchasno', 'nova_poshta', 'turboSMS', 'bank_API', 'binotel'];
const referrals = [
  'https://service.vchasno.ua/prro-offer?utm_source=vortex',
  'https://service.vchasno.ua/prro-offer-50?utm_source=vortex',
];
const copy = language => require(`../../client/src/locales/integrations/${language}.json`);
const shape = value => Array.isArray(value) ? value.map(shape)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, shape(value[key])]))
    : typeof value;

test('every integration card has a local logo and a matching translated detail page', () => {
  for (const [language, content] of Object.entries(catalog)) {
    const section = content.homepage.integrations_catalog_section;
    assert.doesNotMatch(section.section_title + section.section_description, /lorem ipsum/i);
    assert.deepEqual(section.cards.map(card => card.link_href), slugs.map(slug => `/integrations/${slug}`));
    const pages = copy(language).pages;
    assert.deepEqual(Object.keys(pages).sort(), [...slugs].sort());
    for (const card of section.cards) {
      assert.ok(fs.existsSync(path.join(__dirname, '../../client/public', card.image_src)), card.image_src);
      const page = pages[card.link_href.split('/').pop()];
      assert.ok(page.title && page.lead && page.sections.length);
      assert.ok(page.sections.every(section => section.title && section.paragraphs.length));
    }
  }
});

test('integration translations preserve structure, partner URLs and template tokens', () => {
  for (const language of Object.keys(catalog)) {
    const translated = copy(language);
    assert.deepEqual(shape(translated), shape(copy('ua')));
    assert.deepEqual(translated.pages.vchasno.links.map(link => link.href), referrals);
    assert.deepEqual(catalog[language].homepage.integrations_catalog_section.cards[2].partner_links.map(link => link.href), referrals);
    assert.equal(translated.pages.checkbox.links[0].href, 'https://my.checkbox.ua/auth/registration?registration_code=exzPKMg1NQFd');
    assert.ok(JSON.stringify(translated.pages.turboSMS).includes('{ORDER_ID}'));
    assert.doesNotMatch(JSON.stringify(translated), /lorem ipsum|blank_image/i);
    if (language !== 'ua') assert.doesNotMatch(JSON.stringify(translated), /[А-Яа-яІіЇїЄєҐґ]/u);
  }
});
