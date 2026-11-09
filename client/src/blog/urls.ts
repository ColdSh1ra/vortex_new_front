import { LANGUAGES } from '../types/content';
import type { Language } from '../types/content';
export const SITE_URL = 'https://crm-vortex.com';
export const LANGUAGE_CODES: Record<Language, string> = { ua: 'uk', cz: 'cs', sk: 'sk', en: 'en', pl: 'pl' };
export function blogLanguage(search: string): Language {
  const value = new URLSearchParams(search).get('lang');
  return LANGUAGES.includes(value as Language) ? value as Language : 'ua';
}
export function blogUrl(language: Language, slug?: string, page = 1) {
  const params = new URLSearchParams();
  if (page > 1 && !slug) params.set('page', String(page));
  if (language !== 'ua') params.set('lang', language);
  const query = params.toString();
  return `/blog${slug ? `/${slug}` : ''}${query ? `?${query}` : ''}`;
}
export function formatBlogDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(LANGUAGE_CODES[language], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}
