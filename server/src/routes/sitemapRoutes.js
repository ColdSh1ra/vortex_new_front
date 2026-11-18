const express = require('express');
const blog = require('../services/blogService');
const { origin, languageCodes, staticPaths, localizedUrl } = require('../seo/site');
const router = express.Router();
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const xml = (res, content) => res.type('application/xml').set('Cache-Control', 'public, max-age=60').send(`<?xml version="1.0" encoding="UTF-8"?>${content}`);
const urlset = items => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${items.join('')}</urlset>`;
const blogPath = (slug, page = 1) => `/blog${slug ? `/${slug}` : page > 1 ? `?page=${page}` : ''}`;
function variants(path, updatedAt) {
  const alternates = [...Object.entries(languageCodes).map(([language, code]) => `<xhtml:link rel="alternate" hreflang="${code}" href="${escape(localizedUrl(path, language))}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${escape(localizedUrl(path))}"/>`].join('');
  return Object.keys(languageCodes).map(language => `<url><loc>${escape(localizedUrl(path, language))}</loc>${updatedAt ? `<lastmod>${escape(updatedAt)}</lastmod>` : ''}${alternates}</url>`);
}
const unavailable = res => res.status(503).set({ 'Retry-After': '60', 'Cache-Control': 'no-store' }).type('text/plain').send('Sitemap temporarily unavailable.');
const blogIndex = () => blog.sitemapPage().catch(() => null);

router.get('/sitemap.xml', async (req, res) => {
  const result = await blogIndex();
  const totalPages = result?.pagination.totalPages || 0;
  if (totalPages > 49999) return unavailable(res);
  const files = ['pages.xml', ...Array.from({ length: totalPages }, (_, i) => `blog-${i + 1}.xml`)];
  xml(res, `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${files.map(file => `<sitemap><loc>${origin}/sitemaps/${file}</loc></sitemap>`).join('')}</sitemapindex>`);
});
router.get('/sitemaps/pages.xml', async (req, res) => {
  const result = await blogIndex();
  const items = staticPaths.flatMap(path => variants(path));
  if (result) {
    const pages = Math.max(1, Math.ceil(result.pagination.total / blog.PAGE_SIZE));
    if (pages * Object.keys(languageCodes).length + items.length > 50000) return unavailable(res);
    for (let page = 1; page <= pages; page++) items.push(...variants(blogPath(undefined, page)));
  }
  xml(res, urlset(items));
});
router.get('/sitemaps/blog-:page.xml', async (req, res) => {
  const page = /^[1-9]\d{0,5}$/.test(req.params.page) ? Number(req.params.page) : 0;
  if (!page) return res.status(404).end();
  try {
    const result = await blog.sitemapPage(page);
    if (!result || page > result.pagination.totalPages) return res.status(404).end();
    xml(res, urlset(result.data.flatMap(post => variants(blogPath(post.slug), post.updatedAt))));
  } catch { unavailable(res); }
});
module.exports = router;
