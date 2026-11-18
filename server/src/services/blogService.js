const PAGE_SIZE = 16;
const SITEMAP_SIZE = 1000;
const LANGUAGES = ['ua', 'cz', 'sk', 'en', 'pl'];
const configured = () => Boolean(process.env.BLOG_API_BASE_URL || process.env.CMS_API_BASE_URL);
class BlogServiceError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
function apiBaseUrl() {
  if (!configured()) throw new BlogServiceError(503, 'BLOG_API_NOT_CONFIGURED');
  const url = new URL(process.env.BLOG_API_BASE_URL || process.env.CMS_API_BASE_URL);
  if (!['https:', 'http:'].includes(url.protocol)) throw new BlogServiceError(503, 'BLOG_API_CONFIGURATION_ERROR');
  return url.href.replace(/\/$/, '');
}
async function request(path, { previewToken } = {}) {
  let response;
  if (previewToken !== undefined && !/^[a-f0-9]{48}$/i.test(previewToken)) throw new BlogServiceError(403, 'PREVIEW_FORBIDDEN');
  const url = new URL(`${apiBaseUrl()}/blog/${path}`);
  if (previewToken) url.searchParams.set('token', previewToken);
  try { response = await fetch(url.href, { headers: { Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(8000) }); }
  catch (error) { if (error instanceof BlogServiceError) throw error; throw new BlogServiceError(503, 'BLOG_API_UNAVAILABLE'); }
  if (!response.ok) throw new BlogServiceError(response.status === 403 && previewToken ? 403 : response.status === 404 ? 404 : 503, response.status === 403 && previewToken ? 'PREVIEW_FORBIDDEN' : response.status === 404 ? 'BLOG_NOT_FOUND' : 'BLOG_API_UNAVAILABLE');
  try { return await response.json(); } catch { throw new BlogServiceError(502, 'BLOG_INVALID_RESPONSE'); }
}
async function redirectForSlug(slug) {
  if (!configured()) return null;
  try {
    const result = await request(`redirects/${encodeURIComponent(slug)}`);
    const target = result?.data;
    if (!target || target.from !== slug || typeof target.to !== 'string' || target.to.length > 160
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target.to) || target.to === slug) throw new BlogServiceError(502, 'BLOG_INVALID_RESPONSE');
    return target;
  } catch (error) { if (error.status === 404) return null; throw error; }
}
async function sitemapPage(page = 1) {
  if (!configured()) return null;
  const result = await request(`sitemap?page=${page}&limit=${SITEMAP_SIZE}`);
  const p = result?.pagination;
  if (!Array.isArray(result?.data) || !p || p.page !== page || p.limit !== SITEMAP_SIZE || !Number.isSafeInteger(p.total) || p.total < 0
    || p.totalPages !== Math.ceil(p.total / SITEMAP_SIZE) || result.data.length !== Math.max(0, Math.min(SITEMAP_SIZE, p.total - (page - 1) * SITEMAP_SIZE))) throw new BlogServiceError(502, 'BLOG_INVALID_RESPONSE');
  const slugs = new Set();
  for (const post of result.data) {
    if (!post || typeof post.slug !== 'string' || post.slug.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || slugs.has(post.slug)
      || typeof post.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(post.updatedAt) || !Number.isFinite(Date.parse(post.updatedAt))
      || !Array.isArray(post.availableLanguages) || post.availableLanguages.length !== 5 || !LANGUAGES.every(l => post.availableLanguages.includes(l))) throw new BlogServiceError(502, 'BLOG_INVALID_RESPONSE');
    slugs.add(post.slug);
  }
  return result;
}
module.exports = { request, apiBaseUrl, configured, sitemapPage, redirectForSlug, PAGE_SIZE, SITEMAP_SIZE, BlogServiceError };
