const contentModel = require('../models/contentModel');
const sanitizeContent = require('../security/sanitizeContent');

const LANGUAGES = ['ua', 'cz', 'sk', 'en', 'pl'];
const TOKEN = /^[a-f0-9]{48}$/i;
class CmsError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function safeTarget(value) {
  if (value === '') return true;
  if (typeof value !== 'string' || value.length > 4000 || /[\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith('#') || /^\/(?!\/)/.test(value)) return true;
  try {
    const url = new URL(value);
    return !url.username && !url.password && (url.protocol === 'https:' || (['mailto:', 'tel:'].includes(url.protocol) && !!url.pathname));
  } catch { return false; }
}
function validateTargets(value, key = '', location = '') {
  if (Array.isArray(value)) { for (const item of value) validateTargets(item, key, `${location}[]`); return; }
  if (object(value)) { for (const [name, item] of Object.entries(value)) validateTargets(item, name, `${location}.${name}`); return; }
  if (/\.autoshrot\.navigation\.items\[\]\.target$/.test(location) && /^(?:car|statuses|removal|workflow)$/.test(value)) return;
  const target = /^(?:target|href|url|path|link_href|link_target|cta_target|secondary_cta_target|button_target|try_free_target|try_demo_target|privacy_link)$/.test(key);
  const media = /^(?:image|image_src|image_path|photo_path|logo|header_logo|footer_logo|website_image_src|about_us_image_path|slide_image_paths|share_image|icon)$/.test(key);
  if ((target || media) && value !== null && !safeTarget(value)) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
  if (media && typeof value === 'string' && value !== '' && !/^(?:https:\/\/|\/(?!\/))/.test(value)) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
}
function validateCatalog(value) {
  if (!object(value) || Object.keys(value).length !== 5 || !LANGUAGES.every(language => {
    const data = value[language];
    return object(data) && object(data.homepage) && typeof data.homepage.title === 'string'
      && typeof data.homepage.subtitle === 'string' && object(data.ui)
      && Object.values(data.ui).every(text => typeof text === 'string')
      && Array.isArray(data.FAQ) && Array.isArray(data.videos)
      && object(data.contacts) && Array.isArray(data.contacts.workers)
      && object(data.settings) && object(data.settings.pricing_calculator)
      && object(data.car_service) && Array.isArray(data.car_service.blocks);
  })) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
  validateTargets(value);
  return value;
}

function apiBaseUrl() {
  if (!process.env.CMS_API_BASE_URL) throw new CmsError(503, 'CONTENT_NOT_CONFIGURED');
  let url;
  try { url = new URL(process.env.CMS_API_BASE_URL); } catch { throw new CmsError(503, 'CONTENT_CONFIGURATION_ERROR'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new CmsError(503, 'CONTENT_CONFIGURATION_ERROR');
  return url.href.replace(/\/$/, '');
}
const configured = () => Boolean(process.env.CMS_API_BASE_URL);

function createCmsService({ fetchImpl = (...args) => fetch(...args), now = Date.now, revalidateMs = 15000 } = {}) {
  const snapshots = new Map();
  const pending = new Map();
  async function request(path, { headers = {}, token } = {}) {
    if (token !== undefined && !TOKEN.test(token)) throw new CmsError(403, 'PREVIEW_FORBIDDEN');
    const url = new URL(`${apiBaseUrl()}/${path}`);
    if (token) url.searchParams.set('token', token);
    try {
      return await fetchImpl(url.href, { headers: { Accept: 'application/json', ...headers }, redirect: 'error', signal: AbortSignal.timeout(8000) });
    } catch { throw new CmsError(503, 'CONTENT_UNAVAILABLE'); }
  }
  async function jsonResponse(response, preview = false) {
    if (preview && response.status === 403) throw new CmsError(403, 'PREVIEW_FORBIDDEN');
    if (!response.ok) throw new CmsError(503, 'CONTENT_UNAVAILABLE');
    if (!/application\/json/i.test(response.headers.get('content-type') || '')) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
    try { return await response.json(); } catch { throw new CmsError(503, 'CONTENT_INVALID_RESPONSE'); }
  }
  async function snapshot({ previewToken } = {}) {
    if (previewToken !== undefined) {
      const content = await sanitizeContent(validateCatalog(await jsonResponse(await request('content/preview', { token: previewToken }), true)));
      return { content, preview: true, source: 'cms', stale: false };
    }
    if (!configured()) return { content: await sanitizeContent(await contentModel.getContent()), source: 'local', preview: false, stale: false };
    const key = apiBaseUrl();
    const cached = snapshots.get(key);
    if (cached && now() - cached.checkedAt < revalidateMs) return cached;
    if (pending.has(key)) return pending.get(key);
    const work = (async () => {
      try {
        const response = await request('content', { headers: cached ? { 'If-None-Match': cached.etag } : {} });
        if (response.status === 304) {
          if (!cached || response.headers.get('etag') !== cached.etag || response.headers.get('x-content-revision') !== String(cached.revision)) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
          const result = { ...cached, checkedAt: now(), stale: false };
          snapshots.set(key, result);
          return result;
        }
        const body = await jsonResponse(response);
        const revision = response.headers.get('x-content-revision');
        const etag = response.headers.get('etag');
        if (!/^\d+$/.test(revision || '') || !Number.isSafeInteger(Number(revision)) || etag !== `"cms-${revision}"`
          || (cached && Number(revision) < cached.revision)) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
        const content = await sanitizeContent(validateCatalog(body));
        const result = { content, etag, revision: Number(revision), checkedAt: now(), stale: false, preview: false, source: 'cms' };
        snapshots.set(key, result);
        return result;
      } catch (error) {
        // A configured CMS never silently falls back to the build's local JSON.
        // Only an already validated published revision may survive an outage.
        if (cached) {
          const result = { ...cached, checkedAt: now(), stale: true };
          snapshots.set(key, result);
          return result;
        }
        throw error;
      } finally { pending.delete(key); }
    })();
    pending.set(key, work);
    return work;
  }
  async function media() {
    if (!configured()) return { data: {} };
    const result = await jsonResponse(await request('content/media'));
    if (!object(result?.data)) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
    const validUrl = value => typeof value === 'string' && /^(?:https:\/\/[^/]+\/|\/imgs\/)/.test(value) && !/^\/\//.test(value);
    for (const [url, entry] of Object.entries(result.data)) {
      if (!validUrl(url) || !object(entry) || typeof entry.mime !== 'string' || !Number.isSafeInteger(entry.size) || entry.size < 0
        || !object(entry.alt) || !LANGUAGES.every(language => typeof entry.alt[language] === 'string')
        || !Array.isArray(entry.variants) || (entry.mime.startsWith('image/') && (!Number.isFinite(entry.width) || entry.width <= 0 || !Number.isFinite(entry.height) || entry.height <= 0))
        || !entry.variants.every(variant => object(variant) && ['original', 'webp', 'thumb'].includes(variant.role) && validUrl(variant.url))) throw new CmsError(503, 'CONTENT_INVALID_RESPONSE');
    }
    return result;
  }
  return { snapshot, media, request, jsonResponse, clear: () => { snapshots.clear(); pending.clear(); } };
}
module.exports = { ...createCmsService(), createCmsService, configured, apiBaseUrl, CmsError, TOKEN, validateCatalog, safeTarget };
