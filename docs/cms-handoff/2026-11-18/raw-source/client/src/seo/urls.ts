import { LANGUAGES } from '../types/content';
import type { Language } from '../types/content';
import site from '../../../shared/site.json';

const DOCUMENT_PATHS = new Set([...site.staticPaths, '/blog']);

export function languageFromSearch(search: string): Language {
  const value = new URLSearchParams(search).get('lang');
  return LANGUAGES.includes(value as Language) ? value as Language : 'ua';
}

/** Keep resources, external destinations and in-page anchors untouched. */
export function localizedUrl(path: string, language: Language): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const url = new URL(path, site.origin);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  if (!DOCUMENT_PATHS.has(pathname) && !pathname.startsWith('/blog/') && !pathname.startsWith('/integrations/')) return path;
  const explicitLanguage = url.searchParams.get('lang');
  const selected = LANGUAGES.includes(explicitLanguage as Language) ? explicitLanguage as Language : language;
  if (selected === 'ua') url.searchParams.delete('lang');
  else url.searchParams.set('lang', selected);
  const query = url.searchParams.toString();
  return `${pathname}${query ? `?${query}` : ''}${url.hash}`;
}

/** A language switch must replace the language already present in the URL. */
export function languageVariantUrl(path: string, language: Language): string {
  const url = new URL(path, site.origin);
  url.searchParams.delete('lang');
  if (language !== 'ua') url.searchParams.set('lang', language);
  return `${url.pathname}${url.search}${url.hash}`;
}
