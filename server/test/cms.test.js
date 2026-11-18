const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { once } = require('node:events');
const cms = require('../src/services/cmsService');
const { cmsPreview } = require('../src/middleware/cmsPreview');
const contentRoutes = require('../src/routes/contentRoutes');
const sanitizeContent = require('../src/security/sanitizeContent');
const { resolveWebsiteTariff } = require('../src/controllers/trialRequestController');
const blog = require('../src/services/blogService');
const { publicPaths } = require('../src/services/contentVisibility');
const local = require('../data/vortex.json');
const fetchNative = global.fetch;
const json = (body, revision = 7, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ETag: `"cms-${revision}"`, 'X-Content-Revision': String(revision) } });

function withCms(t, fetchImpl) {
  const previous = process.env.CMS_API_BASE_URL;
  process.env.CMS_API_BASE_URL = 'https://cms.example/api';
  if (fetchImpl) { global.fetch = fetchImpl; t.after(() => { global.fetch = fetchNative; }); }
  cms.clear();
  t.after(() => { cms.clear(); if (previous === undefined) delete process.env.CMS_API_BASE_URL; else process.env.CMS_API_BASE_URL = previous; });
}
async function start(t, app) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  return `http://127.0.0.1:${server.address().port}`;
}

test('CMS publishes one validated five-language revision, preserves 304 and serves last good data during outages', async t => {
  withCms(t);
  let time = 0;
  const calls = [];
  let mode = 'published';
  const service = cms.createCmsService({ now: () => time, fetchImpl: async (_url, options) => {
    calls.push(options.headers);
    if (mode === '304') return new Response(null, { status: 304, headers: { ETag: '"cms-7"', 'X-Content-Revision': '7' } });
    if (mode === 'outage') return json({ code: 'CONTENT_UNAVAILABLE' }, 7, 503);
    if (mode === 'invalid') return json({ ua: local.ua });
    return json(local);
  } });
  const first = await service.snapshot();
  assert.equal(first.revision, 7);
  assert.deepEqual(Object.keys(first.content).sort(), ['cz', 'en', 'pl', 'sk', 'ua']);
  await service.snapshot();
  assert.equal(calls.length, 1);
  mode = '304'; time = 16000;
  const unchanged = await service.snapshot();
  assert.equal(unchanged.content, first.content);
  assert.equal(calls[1]['If-None-Match'], '"cms-7"');
  mode = 'outage'; time = 32000;
  const stale = await service.snapshot();
  assert.equal(stale.content, first.content);
  assert.equal(stale.stale, true);
  mode = 'invalid'; time = 48000;
  assert.equal((await service.snapshot()).content, first.content);
});

test('cold CMS failure, HTML and incomplete translations cannot silently fall back to local content', async t => {
  withCms(t);
  for (const response of [new Response('<h1>Apache 404</h1>', { status: 404 }), json({ ua: local.ua }), json({ code: 'CONTENT_UNAVAILABLE' }, 1, 503)]) {
    const service = cms.createCmsService({ fetchImpl: async () => response });
    await assert.rejects(service.snapshot(), error => error.status === 503);
  }
});

test('published and preview requests are isolated and invalid preview never becomes published content', async t => {
  let previewAllowed = true;
  const draft = structuredClone(local);
  draft.ua.homepage.title = 'DRAFT ONLY';
  withCms(t, async url => {
    if (String(url).includes('/content/preview')) return previewAllowed ? json(draft) : json({ code: 'PREVIEW_FORBIDDEN' }, 7, 403);
    return json(local);
  });
  const app = express();
  app.disable('etag');
  app.use(cmsPreview);
  app.use('/api', contentRoutes);
  const base = await start(t, app);
  const token = 'a'.repeat(48);
  const exchange = await fetchNative(`${base}/?lang=pl&cms_preview=${token}`, { redirect: 'manual' });
  assert.equal(exchange.status, 303);
  assert.equal(exchange.headers.get('location'), '/?lang=pl');
  const cookie = exchange.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=900/);
  assert.ok(!cookie.includes(token));
  assert.ok(!(await exchange.text()).includes(token));
  const preview = await fetchNative(`${base}/api/content`, { headers: { Cookie: cookie.split(';')[0] } });
  assert.equal(preview.status, 200);
  assert.match(preview.headers.get('cache-control'), /private, no-store/);
  assert.equal(preview.headers.get('etag'), null);
  assert.equal(preview.headers.get('referrer-policy'), 'no-referrer');
  assert.equal((await preview.json()).ua.homepage.title, 'DRAFT ONLY');
  const published = await fetchNative(`${base}/api/content`);
  assert.equal((await published.json()).ua.homepage.title, local.ua.homepage.title);
  previewAllowed = false;
  const expired = await fetchNative(`${base}/api/content`, { headers: { Cookie: cookie.split(';')[0] } });
  assert.equal(expired.status, 403);
  assert.deepEqual(await expired.json(), { code: 'PREVIEW_FORBIDDEN' });
  const ended = await fetchNative(`${base}/api/content/preview/end`, { method: 'POST', headers: { Cookie: cookie.split(';')[0] } });
  assert.equal(ended.status, 204);
  assert.match(ended.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
});

test('preview session expires after 15 minutes and malformed or duplicate tokens are rejected', async t => {
  withCms(t, async () => json(local));
  const originalNow = Date.now;
  let time = originalNow();
  Date.now = () => time;
  t.after(() => { Date.now = originalNow; });
  const app = express(); app.disable('etag'); app.use(cmsPreview); app.use('/api', contentRoutes);
  const base = await start(t, app);
  for (const query of ['cms_preview=bad', `cms_preview=${'a'.repeat(48)}&cms_preview=${'b'.repeat(48)}`]) {
    const invalid = await fetchNative(`${base}/?${query}`, { redirect: 'manual' });
    assert.equal(invalid.status, 403);
    assert.equal(invalid.headers.get('set-cookie'), null);
    await invalid.text();
  }
  const response = await fetchNative(`${base}/?cms_preview=${'a'.repeat(48)}`, { redirect: 'manual' });
  const cookie = response.headers.get('set-cookie').split(';')[0];
  await response.text();
  time += 15 * 60 * 1000 + 1;
  const expired = await fetchNative(`${base}/api/content`, { headers: { Cookie: cookie } });
  assert.equal(expired.status, 403);
  await expired.text();
});

test('public content GET/HEAD/304 preserve revision headers and every write is rejected', async t => {
  withCms(t, async () => json(local));
  const app = express(); app.disable('etag'); app.use('/api', contentRoutes);
  const base = await start(t, app);
  const initial = await fetchNative(`${base}/api/content`);
  assert.equal(initial.headers.get('etag'), '"cms-7"');
  assert.equal(initial.headers.get('x-content-revision'), '7');
  await initial.text();
  const cached = await fetchNative(`${base}/api/content`, { headers: { 'If-None-Match': '"cms-7"' } });
  assert.equal(cached.status, 304);
  assert.equal(await cached.text(), '');
  assert.equal(cached.headers.get('x-content-revision'), '7');
  const head = await fetchNative(`${base}/api/content`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('etag'), '"cms-7"');
  assert.equal(await head.text(), '');
  const write = await fetchNative(`${base}/api/content`, { method: 'POST' });
  assert.equal(write.status, 405);
  assert.equal(write.headers.get('allow'), 'GET, HEAD');
  await write.text();
});

test('CMS HTML policy preserves code, Quill/video classes and safe links while removing executable markup', async () => {
  const content = structuredClone(local);
  content.ua.FAQ[0].answer = '<h3 class="ql-align-center bad" style="color:red">Title</h3><p><u>Underlined</u> <s>Old</s> <code>x</code><a href="https://example.com" target="_blank" onclick="evil()">Open</a><img src=x onerror=evil()><script>evil()</script></p>';
  content.ua.privacy_policy = { sections: [{ id: 'one', title: '', html: '<code>vortex-language</code><a href="javascript:evil()">Bad</a>' }] };
  content.ua.videos = [{ topic: 'Video', intro: '<p>Intro</p>', cards: [{ title: '<script>literal</script>', url: 'javascript:evil()', caption: 'Caption', brand: 'VORTEX' }] }];
  const clean = await sanitizeContent(content);
  assert.match(clean.ua.FAQ[0].answer, /class="ql-align-center"/);
  assert.match(clean.ua.FAQ[0].answer, /<code>x<\/code>/);
  assert.match(clean.ua.FAQ[0].answer, /rel="noopener noreferrer"/);
  assert.doesNotMatch(clean.ua.FAQ[0].answer, /onclick|style=|<script|<img|class="bad/);
  assert.match(clean.ua.privacy_policy.sections[0].html, /<code>vortex-language<\/code>/);
  assert.doesNotMatch(clean.ua.privacy_policy.sections[0].html, /javascript:/);
  assert.match(clean.ua.videos[0].answer, /faq-video-grid/);
  assert.doesNotMatch(clean.ua.videos[0].answer, /href="javascript:/);
});

test('website request uses only a visible published tariff and server price/currency/billing type', t => {
  withCms(t);
  const catalog = structuredClone(local);
  catalog.pl.websites = { pricing: { visible: true, tariffs: [{ id: 'custom-id', name: 'Custom', price: 777, currency: 'EUR', billing_type: 'one_time' }] } };
  const data = { language: 'pl', website_package: 'custom-id', total_sum: .01 };
  assert.deepEqual(resolveWebsiteTariff(data, catalog), { total_sum: 777, total_currency: 'EUR', billing_type: 'one_time', website_package_name: 'Custom' });
  catalog.pl.websites.pricing.tariffs[0].visible = false;
  assert.equal(resolveWebsiteTariff(data, catalog), null);
  assert.equal(resolveWebsiteTariff({ ...data, website_package: 'maximum' }, catalog), null);
  catalog.pl.websites.pricing.visible = false;
  assert.equal(resolveWebsiteTariff(data, catalog), null);
});

test('blog redirects validate current slug and distinguish missing records from outages', async t => {
  withCms(t);
  const previous = process.env.BLOG_API_BASE_URL; delete process.env.BLOG_API_BASE_URL;
  t.after(() => { if (previous !== undefined) process.env.BLOG_API_BASE_URL = previous; });
  let result = json({ data: { from: 'old-slug', to: 'new-slug' } });
  global.fetch = async () => result;
  t.after(() => { global.fetch = fetchNative; });
  assert.deepEqual(await blog.redirectForSlug('old-slug'), { from: 'old-slug', to: 'new-slug' });
  for (const to of ['https://evil.example', '../bad', 'old-slug', '//evil.example']) {
    result = json({ data: { from: 'old-slug', to } });
    await assert.rejects(blog.redirectForSlug('old-slug'), error => error.code === 'BLOG_INVALID_RESPONSE');
  }
  result = json({ code: 'BLOG_NOT_FOUND' }, 1, 404);
  assert.equal(await blog.redirectForSlug('old-slug'), null);
  result = json({ code: 'BLOG_API_UNAVAILABLE' }, 1, 503);
  await assert.rejects(blog.redirectForSlug('old-slug'), error => error.status === 503);
});

test('hidden CMS pages disappear from public discovery paths, including mixed-case integration slugs', () => {
  const data = { privacy_policy: { visible: false }, tecdoc: { visible: false }, integration_pages: { visible: true, pages: { turboSMS: { visible: true }, bank_API: { visible: false } } } };
  assert.deepEqual(publicPaths(data, ['/', '/privacy-policy', '/tecdoc-license', '/integrations/old']), ['/', '/integrations/turboSMS']);
});
