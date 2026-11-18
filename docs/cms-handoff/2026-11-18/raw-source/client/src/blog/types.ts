import type { Language } from '../types/content';

export type LocalizedText = Record<Language, string>;
export type BlogSection = { id: string; heading: string; paragraphs: string[] };
export type BlogTranslation = { title: string; excerpt: string; seo: { title: string; description: string } };
export type BlogSummary = {
  id: string;
  slug: string;
  cover: { url: string; width: number; height: number; alt: LocalizedText };
  publishedAt: string;
  updatedAt: string;
  author: { name: string; type: 'Person' | 'Organization' };
  translations: Record<Language, BlogTranslation>;
};
export type BlogArticle = Omit<BlogSummary, 'translations'> & {
  translations: Record<Language, BlogTranslation & { sections: BlogSection[] }>;
};
export type BlogList = { data: BlogSummary[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
export type BlogResource = {
  key: string;
  status: 'ready' | 'not-found' | 'error';
  mode: 'live' | 'demo';
  list?: BlogList;
  article?: BlogArticle;
};
export const BLOG_PAGE_SIZE = 16;
export const BLOG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function blogRoute(url: string) {
  const parsed = new URL(url, 'https://crm-vortex.com');
  if (parsed.pathname === '/blog' || parsed.pathname === '/blog/') {
    const value = parsed.searchParams.get('page') ?? '1';
    const page = /^[1-9]\d{0,5}$/.test(value) ? Number(value) : 0;
    return { key: `list:${page}`, page, slug: null };
  }
  if (parsed.pathname.startsWith('/blog/')) {
    const slug = parsed.pathname.slice(6).replace(/\/$/, '');
    return { key: `article:${slug}`, page: null, slug };
  }
  return null;
}
