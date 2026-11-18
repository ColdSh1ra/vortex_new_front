const cms = require('../services/cmsService');
const { endPreview, privacyHeaders, clearPreview } = require('../middleware/cmsPreview');
async function getContent(req, res) {
  try {
    const snapshot = await cms.snapshot({ previewToken: req.cmsPreview?.token });
    if (snapshot.preview) privacyHeaders(res);
    else {
      res.set('Cache-Control', 'no-cache');
      if (snapshot.etag) res.set({ ETag: snapshot.etag, 'X-Content-Revision': String(snapshot.revision) });
      if (snapshot.stale) res.set('Warning', '110 - "Response is stale"');
      if (snapshot.etag && req.headers['if-none-match']?.split(/\s*,\s*/).includes(snapshot.etag)) return res.status(304).end();
    }
    res.status(200).json(snapshot.content);
  } catch (error) {
    if (req.cmsPreview) privacyHeaders(res);
    if (error.status === 403) clearPreview(req, res);
    res.status(error.status === 403 ? 403 : 503).set('Retry-After', '60').json({ code: error.status === 403 ? 'PREVIEW_FORBIDDEN' : 'CONTENT_UNAVAILABLE' });
  }
}
async function getMedia(req, res) {
  try { const data = await cms.media(); if (req.cmsPreview) privacyHeaders(res); else res.set('Cache-Control', 'no-cache'); res.json(data); }
  catch { res.status(503).set('Retry-After', '60').json({ code: 'CONTENT_UNAVAILABLE' }); }
}
module.exports = { getContent, getMedia, endPreview };
