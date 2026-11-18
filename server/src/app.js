const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { pathToFileURL } = require('url');
const contentRoutes = require('./routes/contentRoutes');
const trialRequestRoutes = require('./routes/trialRequestRoutes');
const contentService = require('./services/contentService');
const blogRoutes = require('./routes/blogRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const blogService = require('./services/blogService');
const { CLIENT_ORIGINS } = require('./config/constants');

const app = express();
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist', 'client');
const ssrEntryPath = path.join(__dirname, '..', '..', 'client', 'dist', 'server', 'entry-server.js');
const { routeResources } = require('./seo/resources');
const { canonicalRequest, languageFromSearch, languageCodes } = require('./seo/site');
const discoveryRoutes = require('./routes/discoveryRoutes');
const { gzipSync, brotliCompressSync, constants } = require('node:zlib');

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self)',
  });
  next();
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || CLIENT_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
}));
app.use(express.json({ limit: '12kb', strict: true }));

app.use('/api', (req, res, next) => { res.set('X-Robots-Tag', 'noindex, nofollow'); next(); });
app.use('/api', contentRoutes);
app.use('/api', trialRequestRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api', (req, res) => res.status(404).json({ code: 'NOT_FOUND' }));
app.use(sitemapRoutes);
app.use(discoveryRoutes);

// A single deterministic address per language, independent of a visitor's cookies.
app.use((req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method) || req.path.startsWith('/assets/') || req.path.startsWith('/imgs/') || req.path.startsWith('/icons/') || req.path.startsWith('/bgs/')) return next();
  const normalized = canonicalRequest(req.originalUrl);
  if (normalized !== req.originalUrl) return res.redirect(301, normalized);
  next();
});

app.use(express.static(clientDistPath, {
  index: false,
  redirect: false,
  setHeaders(res, filePath) {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    else res.setHeader('Cache-Control', 'public, max-age=3600');
  },
}));

app.use(async (req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return next();
  }

  try {
    const template = await fs.readFile(path.join(clientDistPath, 'index.html'), 'utf8');
    const content = await contentService.fetchContent();
    const { render, loadBlogRoute } = await import(pathToFileURL(ssrEntryPath).href);
    const requestUrl = new URL(req.originalUrl, 'http://localhost');
    const isBlog = requestUrl.pathname === '/blog' || requestUrl.pathname.startsWith('/blog/');
    const language = languageFromSearch(requestUrl.search);
    const languageTag = languageCodes[language];
    const initialBlog = await loadBlogRoute(req.originalUrl, {
      apiBaseUrl: isBlog && blogService.configured() ? blogService.apiBaseUrl() : undefined,
      demoEnabled: process.env.BLOG_DEMO_MODE !== 'false',
    });
    const { appHtml, headHtml, statusCode, robots } = render(req.originalUrl, content, language, initialBlog);
    const serializedContent = JSON.stringify(content).replace(/</g, '\\u003c');
    const resources = await routeResources(req.originalUrl, content, initialBlog, template);
    const html = template
      .replace('<html lang="uk">', `<html lang="${languageTag}">`)
      // React emits eager-image hints automatically; the head uses the route's critical images only.
      .replace('<!--ssr-outlet-->', appHtml.replace(/<link rel="preload" as="image"[^>]*\/>/g, ''))
      .replace('<!--resource-hints-->', resources.hints)
      .replace('<!--route-styles-->', resources.styles)
      .replace('<!--seo-head-->', headHtml)
      .replace(
        '<!--initial-content-->',
        `<script>window.__VORTEX_CONTENT__=${serializedContent};window.__VORTEX_LANGUAGE__="${language}";window.__VORTEX_BLOG__=${JSON.stringify(initialBlog).replace(/</g, '\\u003c')}</script>`,
      );

    if (robots.startsWith('noindex')) res.set('X-Robots-Tag', 'noindex, follow');
    if (statusCode === 503) res.set('Retry-After', '60');
    res.status(statusCode).set({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Language': languageTag, 'Cache-Control': 'public, max-age=0, must-revalidate' });
    res.vary('Accept-Encoding');
    // Compress server-rendered HTML including the hydration payload.
    if (req.acceptsEncodings('br', 'gzip', 'identity') === 'br') {
      res.set('Content-Encoding', 'br').send(brotliCompressSync(Buffer.from(html), { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }));
    } else if (req.acceptsEncodings('gzip', 'identity') === 'gzip') {
      res.set('Content-Encoding', 'gzip').send(gzipSync(html));
    } else res.send(html);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (req.path.startsWith('/api/')) {
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ message: 'Запит завеликий.' });
    }

    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ message: 'Некоректний JSON.' });
    }

    console.error('API request failed:', error.name);
    return res.status(500).json({ message: 'Внутрішня помилка сервера.' });
  }

  console.error('Page rendering failed:', error.name);
  return res.status(503).set({ 'X-Robots-Tag': 'noindex, follow', 'Retry-After': '60', 'Cache-Control': 'no-store' }).type('text/plain').send('Page temporarily unavailable. Please try again shortly.');
});

module.exports = app;
