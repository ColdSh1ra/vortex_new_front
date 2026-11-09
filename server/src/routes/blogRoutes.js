const express = require('express');
const blog = require('../services/blogService');
const router = express.Router();
const pageNumber = value => typeof value === 'string' && /^[1-9]\d{0,5}$/.test(value) ? Number(value) : null;
router.get('/posts', async (req, res) => {
  const page = pageNumber(req.query.page ?? '1');
  if (!page || (req.query.limit !== undefined && req.query.limit !== '16')) return res.status(400).json({ code: 'BLOG_INVALID_QUERY' });
  try { res.set('Cache-Control', 'no-cache').json(await blog.request(`posts?page=${page}&limit=${blog.PAGE_SIZE}`)); }
  catch (error) { res.status(error.status || 503).json({ code: error.code || 'BLOG_API_UNAVAILABLE' }); }
});
router.get('/posts/:slug', async (req, res) => {
  const slug = req.params.slug;
  if (slug.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return res.status(404).json({ code: 'BLOG_NOT_FOUND' });
  try { res.set('Cache-Control', 'no-cache').json(await blog.request(`posts/${encodeURIComponent(slug)}`)); }
  catch (error) { res.status(error.status || 503).json({ code: error.code || 'BLOG_API_UNAVAILABLE' }); }
});
router.get('/sitemap', async (req, res) => {
  const page = pageNumber(req.query.page ?? '1');
  if (!page || (req.query.limit !== undefined && req.query.limit !== '1000')) return res.status(400).json({ code: 'BLOG_INVALID_QUERY' });
  try {
    const result = await blog.sitemapPage(page);
    if (!result) return res.status(503).json({ code: 'BLOG_API_NOT_CONFIGURED' });
    res.set('Cache-Control', 'no-cache').json(result);
  } catch (error) { res.status(error.status || 503).json({ code: error.code || 'BLOG_API_UNAVAILABLE' }); }
});
router.use((req, res) => res.status(404).json({ code: 'BLOG_NOT_FOUND' }));
module.exports = router;
