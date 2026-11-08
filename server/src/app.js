const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { pathToFileURL } = require('url');
const contentRoutes = require('./routes/contentRoutes');
const trialRequestRoutes = require('./routes/trialRequestRoutes');
const contentService = require('./services/contentService');
const { CLIENT_ORIGINS } = require('./config/constants');

const app = express();
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist', 'client');
const ssrEntryPath = path.join(__dirname, '..', '..', 'client', 'dist', 'server', 'entry-server.js');
const clientManifestPath = path.join(clientDistPath, '.vite', 'manifest.json');

async function getRouteStylesheet(url) {
  try {
    const manifest = JSON.parse(await fs.readFile(clientManifestPath, 'utf8'));
    const pathname = new URL(url, 'http://localhost').pathname;
    let sourceFiles = [
      'src/styles/main.css',
      'src/styles/trial-request.css',
    ];

    if (pathname === '/faq' || pathname.startsWith('/faq/')) {
      sourceFiles = ['src/styles/faq.css'];
    } else if (pathname === '/contact' || pathname.startsWith('/contact/')) {
      sourceFiles = [
        'src/styles/contact.css',
        'src/styles/trial-request.css',
      ];
    } else if (pathname === '/car-service' || pathname.startsWith('/car-service/')) {
      sourceFiles.push('src/styles/car-service.css');
    } else if (pathname === '/websites' || pathname.startsWith('/websites/')) {
      sourceFiles = ['src/styles/websites.css', 'src/styles/trial-request.css'];
    } else if (pathname === '/auto-dismantling' || pathname.startsWith('/auto-dismantling/')) {
      sourceFiles = ['src/styles/auto-dismantling.css', 'src/styles/trial-request.css'];
    } else if (pathname === '/tecdoc-license' || pathname.startsWith('/tecdoc-license/')) {
      sourceFiles = ['src/styles/tecdoc.css', 'src/styles/trial-request.css'];
    }
    const cssFiles = sourceFiles.flatMap((sourceFile) => {
      const entry = manifest[sourceFile];

      if (!entry) {
        return [];
      }

      return entry.css || (entry.file.endsWith('.css') ? [entry.file] : []);
    });

    return cssFiles
      .map((file) => `<link rel="stylesheet" href="/${file}">`)
      .join('');
  } catch {
    return '';
  }
}

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

app.use('/api', contentRoutes);
app.use('/api', trialRequestRoutes);

app.use(express.static(clientDistPath, { index: false }));

app.use(async (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  try {
    const template = await fs.readFile(path.join(clientDistPath, 'index.html'), 'utf8');
    const content = await contentService.fetchContent();
    const { render } = await import(pathToFileURL(ssrEntryPath).href);
    const savedLanguage = req.headers.cookie?.match(/(?:^|;\s*)vortex-language=(ua|cz|sk|en|pl)(?:;|$)/)?.[1];
    const language = savedLanguage || 'ua';
    const languageTag = { ua: 'uk', cz: 'cs', sk: 'sk', en: 'en', pl: 'pl' }[language];
    const { appHtml } = render(req.originalUrl, content, language);
    const serializedContent = JSON.stringify(content).replace(/</g, '\\u003c');
    const routeStylesheet = await getRouteStylesheet(req.originalUrl);
    const html = template
      .replace('<html lang="uk">', `<html lang="${languageTag}">`)
      .replace('<!--ssr-outlet-->', appHtml)
      .replace('<!--route-styles-->', routeStylesheet)
      .replace(
        '<!--initial-content-->',
        `<script>window.__VORTEX_CONTENT__=${serializedContent};window.__VORTEX_LANGUAGE__="${language}"</script>`,
      );

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
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

  return next(error);
});

module.exports = app;
