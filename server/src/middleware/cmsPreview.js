const { randomBytes } = require('node:crypto');
const cms = require('../services/cmsService');
const COOKIE = 'vortex-cms-preview';
const TTL = 15 * 60 * 1000;
const sessions = new Map();
function privacyHeaders(res) {
  res.set({ 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer' });
}
function clearPreview(req, res) {
  if (!req.headers.cookie?.includes(`${COOKIE}=`)) return;
  const id = req.headers.cookie?.match(/(?:^|;\s*)vortex-cms-preview=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (id) sessions.delete(id);
  res.clearCookie(COOKIE, { path: '/', sameSite: 'lax', httpOnly: true, secure: req.secure || process.env.NODE_ENV === 'production' });
}
function previewError(res, status = 403) {
  privacyHeaders(res);
  if (status === 403) clearPreview(res.req, res);
  return res.status(status).type('html').send('<!doctype html><html lang="uk"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow,noarchive"><title>Preview unavailable | Vortex</title><body><h1>Попередній перегляд недоступний</h1><p>Посилання недійсне або строк його дії минув. Відкрийте нове посилання з CMS.</p><p><a href="/">Повернутися на публічний сайт</a></p></body></html>');
}
async function cmsPreview(req, res, next) {
  if (req.path === '/api/content/preview/end' && req.method === 'POST') return next();
  if (/^\/(?:assets|imgs|icons|bgs)\//.test(req.path)) return next();
  const url = new URL(req.originalUrl, 'http://localhost');
  if (url.searchParams.has('cms_preview')) {
    privacyHeaders(res);
    const tokens = url.searchParams.getAll('cms_preview');
    if (!['GET', 'HEAD'].includes(req.method) || req.path.startsWith('/api/') || tokens.length !== 1 || !cms.TOKEN.test(tokens[0])) return previewError(res);
    try {
      await cms.snapshot({ previewToken: tokens[0] });
      for (const [id, value] of sessions) if (value.expiresAt <= Date.now()) sessions.delete(id);
      if (sessions.size >= 250) sessions.delete(sessions.keys().next().value);
      const id = randomBytes(32).toString('hex');
      sessions.set(id, { token: tokens[0], expiresAt: Date.now() + TTL });
      res.cookie(COOKIE, id, { httpOnly: true, sameSite: 'lax', secure: req.secure || process.env.NODE_ENV === 'production', path: '/', maxAge: TTL });
      url.searchParams.delete('cms_preview');
      return res.redirect(303, url.pathname + url.search + url.hash);
    } catch (error) { return previewError(res, error.status === 403 ? 403 : 503); }
  }
  const id = req.headers.cookie?.match(/(?:^|;\s*)vortex-cms-preview=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (id) {
    privacyHeaders(res);
    const session = sessions.get(id);
    if (!session || session.expiresAt <= Date.now()) {
      sessions.delete(id);
      if (req.path.startsWith('/api/')) { clearPreview(req, res); return res.status(403).json({ code: 'PREVIEW_FORBIDDEN' }); }
      return previewError(res);
    }
    req.cmsPreview = session;
  }
  next();
}
function endPreview(req, res) {
  clearPreview(req, res);
  privacyHeaders(res);
  res.status(204).end();
}
module.exports = { cmsPreview, endPreview, privacyHeaders, previewError, clearPreview };
