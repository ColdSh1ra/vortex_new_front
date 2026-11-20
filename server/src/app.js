const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const contentRoutes = require('./routes/contentRoutes');
const trialRequestRoutes = require('./routes/trialRequestRoutes');
const contentService = require('./services/contentService');
const blogRoutes = require('./routes/blogRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const blogService = require('./services/blogService');
const cmsService = require('./services/cmsService');
const { cmsPreview, privacyHeaders, previewError } = require('./middleware/cmsPreview');
const { localizedUrl } = require('./seo/site');
const { CLIENT_ORIGINS, TRUST_PROXY } = require('./config/constants');

const app = express();
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist', 'client');
const { routeResources } = require('./seo/resources');
const { canonicalRequest, languageFromSearch, languageCodes } = require('./seo/site');
const discoveryRoutes = require('./routes/discoveryRoutes');
const { gzipSync, brotliCompressSync, constants } = require('node:zlib');

if (TRUST_PROXY) app.set('trust proxy', /^\d+$/.test(TRUST_PROXY) ? Number(TRUST_PROXY) : TRUST_PROXY);
app.disable('x-powered-by');
app.disable('etag'); // CMS revisions are explicit; private preview responses must not acquire automatic ETags.
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
// Exchange CMS query tokens before canonical normalization can remove them.
app.use(cmsPreview);

app.use('/api', (req, res, next) => { res.set('X-Robots-Tag', req.cmsPreview ? 'noindex, nofollow, noarchive' : 'noindex, nofollow'); next(); });
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
    const snapshot = await contentService.snapshot({ previewToken: req.cmsPreview?.token });
    const content = snapshot.content;
    // Literal specifier so Vercel's file tracer bundles the SSR build and its node_modules.
    const { render, loadBlogRoute } = await import('../../client/dist/server/entry-server.js');
    const requestUrl = new URL(req.originalUrl, 'http://localhost');
    const isBlog = requestUrl.pathname === '/blog' || requestUrl.pathname.startsWith('/blog/');
    const language = languageFromSearch(requestUrl.search);
    const languageTag = languageCodes[language];
    const previewMatch = requestUrl.pathname.match(/^\/blog\/preview\/([a-zA-Z0-9_-]{1,100})$/);
    let previewArticle;
    if (previewMatch) {
      if (!req.cmsPreview) return previewError(res);
      try { previewArticle = (await blogService.request(`preview/${encodeURIComponent(previewMatch[1])}`, { previewToken: req.cmsPreview.token })).data; }
      catch (error) { if (error.status === 403) return previewError(res); if (error.status === 404) previewArticle = null; else throw error; }
    }
    let initialBlog = await loadBlogRoute(req.originalUrl, {
      apiBaseUrl: isBlog && blogService.configured() ? blogService.apiBaseUrl() : undefined,
      demoEnabled: !cmsService.configured() && process.env.BLOG_DEMO_MODE !== 'false',
      checkRedirects: false,
      ...(previewMatch ? { previewArticle } : {}),
    });
    const oldSlug = !previewMatch && requestUrl.pathname.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/)?.[1];
    if (oldSlug && initialBlog?.status === 'not-found') {
      try {
        const redirect = await blogService.redirectForSlug(oldSlug);
        if (redirect) return res.redirect(301, localizedUrl(`/blog/${redirect.to}`, language).replace(/^https?:\/\/[^/]+/, ''));
      } catch { initialBlog = { key: initialBlog.key, status: 'error', mode: 'live' }; }
    }
    const { appHtml, headHtml: originalHead, statusCode, robots } = render(req.originalUrl, content, language, initialBlog, !!req.cmsPreview);
    const headHtml = req.cmsPreview ? originalHead.replace(/<meta\b[^>]*name="robots"[^>]*>/g, '<meta name="robots" content="noindex,nofollow,noarchive">') : originalHead;
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
        `<script>window.__VORTEX_CONTENT__=${serializedContent};window.__VORTEX_LANGUAGE__="${language}";window.__VORTEX_PREVIEW__=${!!req.cmsPreview};window.__VORTEX_BLOG__=${JSON.stringify(initialBlog).replace(/</g, '\\u003c')}</script>`,
      );

    if (robots.startsWith('noindex')) res.set('X-Robots-Tag', 'noindex, follow');
    if (statusCode === 503) res.set('Retry-After', '60');
    res.status(statusCode).set({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Language': languageTag, 'Cache-Control': 'public, max-age=0, must-revalidate' });
    if (req.cmsPreview) privacyHeaders(res);
    else if (snapshot.revision !== undefined) res.set('X-Content-Revision', String(snapshot.revision));
    if (snapshot.stale) res.set('Warning', '110 - "Response is stale"');
    res.vary('Accept-Encoding');
    // Compress server-rendered HTML including the hydration payload.
    if (req.acceptsEncodings('br', 'gzip', 'identity') === 'br') {
      res.set('Content-Encoding', 'br').send(brotliCompressSync(Buffer.from(html), { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }));
    } else if (req.acceptsEncodings('gzip', 'identity') === 'gzip') {
      res.set('Content-Encoding', 'gzip').send(gzipSync(html));
    } else res.send(html);
  } catch (error) {
    if (req.cmsPreview && error.status === 403) return previewError(res);
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
