import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../context/ContentContext';

function ServicesDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const services = [
    { name: t('nav.carService'), path: '/car-service' },
    { name: t('nav.websites'), path: '/websites' },
    { name: t('nav.dismantling'), path: '/auto-dismantling' },
    { name: t('nav.tecdoc'), path: '/tecdoc-license' },
  ];

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setIsOpen(false);
      if (containerRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <li
      className="services-navigation"
      ref={containerRef}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 769px)').matches) setIsOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 769px)').matches) setIsOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <button
        className="nav-link services-toggle"
        type="button"
        ref={triggerRef}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {t('nav.services')}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="services-panel" id={panelId} hidden={!isOpen}>
        <ul className="services-list">
          {services.map((service) => (
            <li key={service.path}>
              <Link
                to={service.path}
                aria-current={pathname === service.path ? 'page' : undefined}
                onClick={() => { setIsOpen(false); onNavigate?.(); }}
              >
                {service.name}
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default ServicesDropdown;
