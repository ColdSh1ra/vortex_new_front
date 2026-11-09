import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { LANGUAGE_TAGS, useI18n } from '../../context/ContentContext';
import { LANGUAGES } from '../../types/content';
import type { Language } from '../../types/content';
import { useLocation, useNavigate } from 'react-router-dom';

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    optionRefs.current[LANGUAGES.indexOf(language)]?.focus();

    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [isOpen, language]);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const selectLanguage = (code: Language) => {
    setLanguage(code);
    if (location.pathname === '/blog' || location.pathname.startsWith('/blog/')) {
      const params = new URLSearchParams(location.search);
      if (code === 'ua') params.delete('lang'); else params.set('lang', code);
      const search = params.toString();
      navigate(`${location.pathname}${search ? `?${search}` : ''}${location.hash}`);
    }
    closeMenu();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = optionRefs.current.findIndex((option) => option === document.activeElement);
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowDown': nextIndex = (index + 1) % LANGUAGES.length; break;
      case 'ArrowUp': nextIndex = (index - 1 + LANGUAGES.length) % LANGUAGES.length; break;
      case 'Home': nextIndex = 0; break;
      case 'End': nextIndex = LANGUAGES.length - 1; break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        return;
      default: return;
    }
    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className="language-switcher"
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
      }}
    >
      <button
        className="language-switcher-trigger"
        type="button"
        ref={triggerRef}
        aria-label={`${t('common.language')}: ${t(`language.${language}`)}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span>{language.toUpperCase()}</span>
        <svg className="language-switcher-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="language-switcher-menu" id={menuId} role="menu" aria-label={t('common.language')} onKeyDown={handleMenuKeyDown}>
          {LANGUAGES.map((code, index) => (
            <button
              className="language-switcher-option"
              type="button"
              role="menuitemradio"
              aria-checked={code === language}
              tabIndex={-1}
              key={code}
              ref={(element) => { optionRefs.current[index] = element; }}
              lang={LANGUAGE_TAGS[code]}
              onClick={() => selectLanguage(code)}
            >
              <span className="language-switcher-code" aria-hidden="true">{code.toUpperCase()}</span>
              <span>{t(`language.${code}`)}</span>
              <svg className="language-switcher-check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
