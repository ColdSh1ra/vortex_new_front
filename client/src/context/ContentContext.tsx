import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ua as fallbackContent } from '../../../server/data/vortex.json';
import { getContent } from '../services/api';
import { LANGUAGES } from '../types/content';
import { interfaceTranslations } from '../locales';
import { blogCopy } from '../blog/copy';
import type { ContentCatalog, Language } from '../types/content';

export const LANGUAGE_TAGS: Record<Language, string> = {
  ua: 'uk', cz: 'cs', sk: 'sk', en: 'en', pl: 'pl',
};

const ContentContext = createContext<{
  catalog: ContentCatalog | null;
  language: Language;
  setLanguage: (language: Language) => void;
  failed: boolean;
} | null>(null);

export function ContentProvider({ children, content = null, initialLanguage = 'ua' }: {
  children: ReactNode;
  content?: ContentCatalog | null;
  initialLanguage?: Language;
}) {
  const [catalog, setCatalog] = useState(content);
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (catalog) return;
    let active = true;
    getContent().then((data) => {
      if (active) setCatalog(data);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [catalog]);

  useEffect(() => {
    // Restore after hydration so server and client initially render the same language.
    if (window.location.pathname === '/blog' || window.location.pathname.startsWith('/blog/')) return;
    try {
      const saved = localStorage.getItem('vortex-language');
      if (LANGUAGES.includes(saved as Language)) setLanguageState(saved as Language);
    } catch { /* The selector also works when storage is unavailable. */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_TAGS[language];
  }, [language]);

  const setLanguage = (next: Language) => {
    if (!LANGUAGES.includes(next)) return;
    setLanguageState(next);
    document.cookie = `vortex-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    try { localStorage.setItem('vortex-language', next); } catch { /* Optional persistence. */ }
  };

  return <ContentContext.Provider value={{ catalog, language, setLanguage, failed }}>{children}</ContentContext.Provider>;
}

export function useI18n() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useI18n requires ContentProvider');
  const content = context.catalog?.[context.language] ?? context.catalog?.ua ?? null;
  const t = (key: string, values: Record<string, string | number> = {}) => {
    const template = interfaceTranslations[context.language][key]
      ?? (key === 'nav.blog' ? blogCopy[context.language]['nav.blog'] : undefined)
      ?? content?.ui[key]
      ?? interfaceTranslations.ua[key]
      ?? context.catalog?.ua.ui[key]
      ?? (fallbackContent.ui as Record<string, string>)[key]
      ?? '';
    return template.replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
  };
  return { ...context, content, t };
}

export function useInitialContent() {
  return useI18n().content;
}
