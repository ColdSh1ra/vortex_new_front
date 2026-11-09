const express = require('express');
const blog = require('../services/blogService');
const router = express.Router();
const SITE = 'https://crm-vortex.com';
const LANGUAGES = { ua: 'uk', cz: 'cs', sk: 'sk', en: 'en', pl: 'pl' };
const STATIC_PATHS = ['/', '/car-service', '/websites', '/auto-dismantling', '/tecdoc-license', '/faq', '/contact'];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const url = (language, slug, page = 1) => {
  const params = new URLSearchParams();
  if (!slug && page > 1) params.set('page', String(page));
  if (language !== 'ua') params.set('lang', language);
  return `${SITE}/blog${slug ? `/${slug}` : ''}${params.size ? `?${params}` : ''}`;
};
const xml = (res, content) => res.type('application/xml').set('Cache-Control', 'public, max-age=60').send(`<?xml version="1.0" encoding="UTF-8"?>${content}`);
const urlset = items => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${items.join('')}</urlset>`;
function variants(slug, page = 1, updatedAt) {
  const alternates = [...Object.entries(LANGUAGES).map(([language, code]) => `<xhtml:link rel="alternate" hreflang="${code}" href="${escape(url(language, slug, page))}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${escape(url('ua', slug, page))}"/>`].join('');
  return Object.keys(LANGUAGES).map(language => `<url><loc>${escape(url(language, slug, page))}</loc>${updatedAt ? `<lastmod>${escape(updatedAt)}</lastmod>` : ''}${alternates}</url>`);
}
const unavailable = res => res.status(503).set({ 'Retry-After': '60', 'Cache-Control': 'no-store' }).type('text/plain').send('Sitemap temporarily unavailable.');
router.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await blog.sitemapPage();
    if ((result?.pagination.totalPages || 0) > 49999) return unavailable(res);
    const files = ['pages.xml', ...Array.from({ length: result?.pagination.totalPages || 0 }, (_, i) => `blog-${i + 1}.xml`)];
    if (files.length > 50000) return unavailable(res);
    xml(res, `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${files.map(file => `<sitemap><loc>${SITE}/sitemaps/${file}</loc></sitemap>`).join('')}</sitemapindex>`);
  } catch { unavailable(res); }
});
router.get('/sitemaps/pages.xml', async (req, res) => {
  try {
    const result = await blog.sitemapPage();
    const items = STATIC_PATHS.map(path => `<url><loc>${SITE}${path}</loc></url>`);
    if (result) {
      const pages = Math.max(1, Math.ceil(result.pagination.total / blog.PAGE_SIZE));
      if (pages * 5 + items.length > 50000) return unavailable(res);
      for (let page = 1; page <= pages; page++) items.push(...variants(undefined, page));
    }
    xml(res, urlset(items));
  } catch { unavailable(res); }
});
router.get('/sitemaps/blog-:page.xml', async (req, res) => {
  const page = /^[1-9]\d{0,5}$/.test(req.params.page) ? Number(req.params.page) : 0;
  if (!page) return res.status(404).end();
  try {
    const result = await blog.sitemapPage(page);
    if (!result || page > result.pagination.totalPages) return res.status(404).end();
    xml(res, urlset(result.data.flatMap(post => variants(post.slug, 1, post.updatedAt))));
  } catch { unavailable(res); }
});
module.exports = router;
