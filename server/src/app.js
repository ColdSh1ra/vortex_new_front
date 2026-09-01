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
    const { appHtml } = render(req.originalUrl, content);
    const serializedContent = JSON.stringify(content).replace(/</g, '\\u003c');
    const html = template
      .replace('<!--ssr-outlet-->', appHtml)
      .replace(
        '<!--initial-content-->',
        `<script>window.__VORTEX_CONTENT__=${serializedContent}</script>`,
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
