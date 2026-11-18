import { languageFromSearch, localizedUrl } from '../seo/urls';
import type { Language } from '../types/content';
import site from '../../../shared/site.json';
export const SITE_URL = site.origin;
export const LANGUAGE_CODES: Record<Language, string> = site.languageCodes;
export function blogLanguage(search: string): Language {
  return languageFromSearch(search);
}
export function blogUrl(language: Language, slug?: string, page = 1) {
  const params = new URLSearchParams();
  if (page > 1 && !slug) params.set('page', String(page));
  const query = params.toString();
  return localizedUrl(`/blog${slug ? `/${encodeURIComponent(slug)}` : ''}${query ? `?${query}` : ''}`, language);
}
export function formatBlogDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(LANGUAGE_CODES[language], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}
