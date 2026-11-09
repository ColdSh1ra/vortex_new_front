import { LANGUAGES } from '../types/content';
import { BLOG_PAGE_SIZE, BLOG_SLUG } from './types';
import type { BlogArticle, BlogList, BlogSummary } from './types';

export class BlogApiError extends Error {
  constructor(public status: number, public code = 'BLOG_API_ERROR') { super(code); }
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, max = 10000): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const integer = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;
const date = (value: unknown) => text(value, 40) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
function imageUrl(value: unknown) {
  if (!text(value, 2000) || !/^(https:\/\/|\/(?!\/))/.test(value)) return false;
  try { const url = new URL(value, 'https://crm-vortex.com'); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
function validSummary(value: unknown, full = false): value is BlogSummary | BlogArticle {
  if (!record(value) || !text(value.id, 100) || !text(value.slug, 160) || !BLOG_SLUG.test(value.slug)
    || !date(value.publishedAt) || !date(value.updatedAt) || Date.parse(String(value.updatedAt)) < Date.parse(String(value.publishedAt)) || !record(value.cover) || !record(value.cover.alt)
    || !imageUrl(value.cover.url)
    || !integer(value.cover.width) || !integer(value.cover.height) || !record(value.author)
    || !text(value.author.name, 160) || !['Person', 'Organization'].includes(String(value.author.type)) || !record(value.translations)) return false;
  const translations = value.translations;
  const alt = value.cover.alt;
  return LANGUAGES.every(language => {
    const item = translations[language];
    if (!text(alt[language], 500) || !record(item) || !text(item.title, 300) || !text(item.excerpt, 1500)
      || !record(item.seo) || !text(item.seo.title, 300) || !text(item.seo.description, 1500)) return false;
    if (!full) return true;
    if (!Array.isArray(item.sections) || !item.sections.length || item.sections.length > 100) return false;
    const ids = new Set<string>();
    return item.sections.every(section => {
      if (!record(section) || !text(section.id, 100) || !BLOG_SLUG.test(section.id) || ids.has(section.id)
        || !text(section.heading, 300) || !Array.isArray(section.paragraphs) || !section.paragraphs.length
        || !section.paragraphs.every(p => text(p, 20000))) return false;
      ids.add(section.id); return true;
    });
  });
}
export function parseBlogArticle(value: unknown): BlogArticle {
  if (!validSummary(value, true)) throw new BlogApiError(502, 'BLOG_INVALID_RESPONSE');
  const article = value as BlogArticle;
  const ids = article.translations.ua.sections.map(section => section.id).join(',');
  if (!LANGUAGES.every(language => article.translations[language].sections.map(section => section.id).join(',') === ids)) throw new BlogApiError(502, 'BLOG_INVALID_RESPONSE');
  return article;
}
export function parseBlogList(value: unknown): BlogList {
  if (!record(value) || !Array.isArray(value.data) || value.data.length > BLOG_PAGE_SIZE || !value.data.every(item => validSummary(item))
    || !record(value.pagination)) throw new BlogApiError(502, 'BLOG_INVALID_RESPONSE');
  const p = value.pagination;
  if (!integer(p.page) || p.limit !== BLOG_PAGE_SIZE || !Number.isSafeInteger(p.total) || Number(p.total) < 0
    || p.totalPages !== Math.ceil(Number(p.total) / BLOG_PAGE_SIZE)
    || value.data.length !== Math.max(0, Math.min(BLOG_PAGE_SIZE, Number(p.total) - (p.page - 1) * BLOG_PAGE_SIZE))
    || new Set(value.data.map(item => item.slug)).size !== value.data.length) throw new BlogApiError(502, 'BLOG_INVALID_RESPONSE');
  return value as BlogList;
}
export async function requestBlog(path: string, baseUrl: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/blog/${path}`, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new BlogApiError(response.status, body.code);
  }
  return response.json();
}
