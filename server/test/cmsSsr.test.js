const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { existsSync } = require('node:fs');
const path = require('node:path');
const fixture = require('../../docs/cms-handoff/2026-11-18/content.json');

test('Node SSR uses CMS revisions, returns language-preserving 301, isolates draft HTML and hides withdrawn pages', {
  skip: !existsSync(path.join(__dirname, '../../client/dist/server/entry-server.js')) && 'Run npm run build before the SSR integration test',
}, async t => {
  const originalFetch = global.fetch;
  const previousCms = process.env.CMS_API_BASE_URL;
  const previousBlog = process.env.BLOG_API_BASE_URL;
  process.env.CMS_API_BASE_URL = 'https://cms-fixture.example/api';
  delete process.env.BLOG_API_BASE_URL;
  const catalog = structuredClone(fixture);
  for (const localized of Object.values(catalog)) {
    localized.homepage.title = 'CMS_PUBLISHED_FIXTURE';
    localized.privacy_policy.visible = false;
    localized.tecdoc.visible = false;
    localized.integration_pages.pages.bank_API.visible = false;
    localized.integration_pages.pages.turboSMS.title = 'CMS_DYNAMIC_INTEGRATION';
  }
  const draft = structuredClone(catalog);
  for (const localized of Object.values(draft)) localized.homepage.title = 'CMS_PRIVATE_DRAFT';
  let previewAllowed = true;
  let redirectCalls = 0;
  const response = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', ETag: '"cms-41"', 'X-Content-Revision': '41' } });
  global.fetch = async value => {
    const url = new URL(String(value));
    if (url.pathname === '/api/content') return response(catalog);
    if (url.pathname === '/api/content/preview') return previewAllowed ? response(draft) : response({ code: 'PREVIEW_FORBIDDEN' }, 403);
    if (url.pathname === '/api/blog/posts/old-slug') return response({ code: 'BLOG_NOT_FOUND' }, 404);
    if (url.pathname === '/api/blog/redirects/old-slug') { redirectCalls++; return response({ data: { from: 'old-slug', to: 'current-slug' } }); }
    if (url.pathname === '/api/blog/preview/article-123') return response({ data: { id: 'article-123', slug: '', cover: { url: '', alt: {} }, author: {}, publishedAt: '', updatedAt: '', translations: { pl: { title: 'PARTIAL_DRAFT_ARTICLE', sections: [{ id: '', heading: '', paragraphs: ['Unfinished draft text'] }] } } } });
    if (url.pathname === '/api/blog/sitemap') return response({ data: [], pagination: { page: 1, limit: 1000, total: 0, totalPages: 0 } });
    throw new Error(`Unexpected fixture API path: ${url.pathname}`);
  };
  const cms = require('../src/services/cmsService');
  cms.clear();
  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    server.closeAllConnections(); server.close(); cms.clear(); global.fetch = originalFetch;
    if (previousCms === undefined) delete process.env.CMS_API_BASE_URL; else process.env.CMS_API_BASE_URL = previousCms;
    if (previousBlog === undefined) delete process.env.BLOG_API_BASE_URL; else process.env.BLOG_API_BASE_URL = previousBlog;
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const published = await originalFetch(`${base}/?lang=pl`);
  assert.equal(published.status, 200);
  assert.equal(published.headers.get('x-content-revision'), '41');
  assert.match(await published.text(), /CMS_PUBLISHED_FIXTURE/);

  const redirect = await originalFetch(`${base}/blog/old-slug?lang=pl`, { redirect: 'manual' });
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), '/blog/current-slug?lang=pl');
  assert.equal(redirectCalls, 1);
  await redirect.text();

  for (const target of ['/privacy-policy', '/tecdoc-license', '/integrations/bank_API']) {
    const hidden = await originalFetch(`${base}${target}?lang=pl`);
    assert.equal(hidden.status, 404, target);
    await hidden.text();
  }
  const integration = await originalFetch(`${base}/integrations/turboSMS?lang=pl`);
  assert.equal(integration.status, 200);
  assert.match(await integration.text(), /CMS_DYNAMIC_INTEGRATION/);
  for (const target of ['/sitemaps/pages.xml', '/llms.txt']) {
    const discovery = await originalFetch(base + target);
    assert.equal(discovery.status, 200);
    const body = await discovery.text();
    assert.ok(!body.includes('https://crm-vortex.com/privacy-policy'));
    assert.ok(!body.includes('https://crm-vortex.com/tecdoc-license'));
    assert.ok(!body.includes('https://crm-vortex.com/integrations/bank_API'));
    assert.ok(body.includes('https://crm-vortex.com/integrations/turboSMS'));
  }

  const token = 'd'.repeat(48);
  const exchange = await originalFetch(`${base}/?lang=pl&cms_preview=${token}`, { redirect: 'manual' });
  assert.equal(exchange.status, 303);
  assert.equal(exchange.headers.get('location'), '/?lang=pl');
  const cookie = exchange.headers.get('set-cookie').split(';')[0];
  await exchange.text();
  const privatePage = await originalFetch(`${base}/?lang=pl`, { headers: { Cookie: cookie } });
  assert.equal(privatePage.status, 200);
  assert.equal(privatePage.headers.get('cache-control'), 'private, no-store');
  assert.equal(privatePage.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(privatePage.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  const html = await privatePage.text();
  assert.ok(html.includes('CMS_PRIVATE_DRAFT'));
  assert.ok(html.includes('__VORTEX_PREVIEW__=true'));
  assert.ok(html.includes('noindex,nofollow,noarchive'));
  assert.ok(!html.includes(token));
  assert.ok(!html.includes('cms_preview='));

  const forbiddenArticle = await originalFetch(`${base}/blog/preview/article-123?lang=pl`);
  assert.equal(forbiddenArticle.status, 403);
  await forbiddenArticle.text();
  const article = await originalFetch(`${base}/blog/preview/article-123?lang=pl`, { headers: { Cookie: cookie } });
  assert.equal(article.status, 200);
  assert.match(await article.text(), /PARTIAL_DRAFT_ARTICLE/);
  assert.equal(article.headers.get('cache-control'), 'private, no-store');
  const afterPreview = await originalFetch(`${base}/?lang=pl`);
  const afterHtml = await afterPreview.text();
  assert.ok(afterHtml.includes('CMS_PUBLISHED_FIXTURE'));
  assert.ok(!afterHtml.includes('CMS_PRIVATE_DRAFT'));

  previewAllowed = false;
  const expired = await originalFetch(`${base}/?lang=pl`, { headers: { Cookie: cookie } });
  assert.equal(expired.status, 403);
  assert.match(expired.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
  assert.match(await expired.text(), /href="\/"/);
});
