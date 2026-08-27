const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { pathToFileURL } = require('url');
const contentRoutes = require('./routes/contentRoutes');
const contentService = require('./services/contentService');

const app = express();
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist', 'client');
const ssrEntryPath = path.join(__dirname, '..', '..', 'client', 'dist', 'server', 'entry-server.js');

app.use(cors());
app.use(express.json());

app.use('/api', contentRoutes);

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

module.exports = app;
