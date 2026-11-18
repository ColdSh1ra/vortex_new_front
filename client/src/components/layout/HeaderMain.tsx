import { useI18n } from '../../context/ContentContext';
import LanguageSwitcher from './LanguageSwitcher';
import ServicesDropdown from './ServicesDropdown';
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Link from '../default/LocalizedLink';
import type { NavigationLink } from "../../types/navigation";
import ButtonFill from "../default/ButtonFIll";
import { blogUrl } from '../../blog/urls';
import { localizedUrl } from '../../seo/urls';
import { SOCIAL_LINKS } from '../../data/socialLinks';

function getMenuLinks(t: (key: string) => string, pricingPath: string, blogPath: string): NavigationLink[] { return [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.pricing"), path: pricingPath },
    { name: t("nav.faq"), path: "/faq" },
    { name: t("nav.blog"), path: blogPath },
    { name: t("nav.contacts"), path: "/contact" },
]; }


function HeaderMain() {
  const { t, language } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [revealMotion, setRevealMotion] = useState<'scale' | 'slide'>('scale');
  const headerRef = useRef<HTMLElement>(null);
  const fullHeaderRef = useRef<HTMLDivElement>(null);
  const compactButtonRef = useRef<HTMLButtonElement>(null);
  const compactRef = useRef(false);
  const scheduleClearance = useRef<() => void>(() => {});
  const lastScrollY = useRef(0);
  const scrollAnimationFrame = useRef<number | null>(null);
  const location = useLocation();
  const pricingPath = ['/car-service', '/websites'].includes(location.pathname)
    ? `${location.pathname}#pricing` : '/#pricing';
  const menuLinks = getMenuLinks(t, pricingPath, blogUrl(language));
  const navigate = useNavigate();

  const changeHeader = useCallback((compact: boolean, motion: 'scale' | 'slide' = 'scale') => {
    if (compactRef.current === compact) return;
    compactRef.current = compact;
    setRevealMotion(motion);
    setIsCompact(compact);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    changeHeader(false);
    lastScrollY.current = Math.max(window.scrollY, 0);
  }, [location.pathname, location.search, changeHeader]);

  useEffect(() => {
    lastScrollY.current = Math.max(window.scrollY, 0);
    const handleScroll = () => {
      if (scrollAnimationFrame.current !== null) return;
      scrollAnimationFrame.current = window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const difference = currentScrollY - lastScrollY.current;
        const focused = document.activeElement;
        const hasKeyboardFocus = focused instanceof HTMLElement
          && fullHeaderRef.current?.contains(focused) && focused.matches(':focus-visible');
        const hasOpenControl = !!fullHeaderRef.current?.querySelector('[aria-expanded="true"]');

        if (currentScrollY <= 24) changeHeader(false, difference < 0 ? 'slide' : 'scale');
        else if (!isMenuOpen && !hasKeyboardFocus && !hasOpenControl) {
          if (difference > 8 && currentScrollY > 96) changeHeader(true);
          else if (difference < -6) changeHeader(false, 'slide');
        }
        if (Math.abs(difference) > 6 || currentScrollY <= 24) lastScrollY.current = currentScrollY;
        scrollAnimationFrame.current = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollAnimationFrame.current !== null) window.cancelAnimationFrame(scrollAnimationFrame.current);
      scrollAnimationFrame.current = null;
    };
  }, [isMenuOpen, changeHeader]);

  // The invisible full panel keeps its layout height, so collapsing never moves
  // the page. Sticky titles use the height of the currently visible bar instead.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue('--site-header-clearance');
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const header = headerRef.current;
      const visible = compactRef.current ? compactButtonRef.current : fullHeaderRef.current;
      if (!header || !visible) return;
      const clearance = `${Math.ceil(Math.max(0, header.getBoundingClientRect().top) + visible.offsetHeight + 12)}px`;
      if (root.style.getPropertyValue('--site-header-clearance') !== clearance) {
        root.style.setProperty('--site-header-clearance', clearance);
        window.dispatchEvent(new Event('vortex:header-layout'));
      }
    };
    const schedule = () => { if (frame === null) frame = window.requestAnimationFrame(measure); };
    scheduleClearance.current = schedule;
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    for (const element of [headerRef.current, fullHeaderRef.current, compactButtonRef.current]) {
      if (element) observer?.observe(element);
    }
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    schedule();
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
      scheduleClearance.current = () => {};
      if (previous) root.style.setProperty('--site-header-clearance', previous);
      else root.style.removeProperty('--site-header-clearance');
      window.dispatchEvent(new Event('vortex:header-layout'));
    };
  }, []);

  useEffect(() => { scheduleClearance.current(); }, [isCompact]);

  const expandHeader = (keyboard: boolean) => {
    lastScrollY.current = Math.max(window.scrollY, 0);
    changeHeader(false);
    if (keyboard) window.requestAnimationFrame(() => {
      const selector = window.matchMedia('(max-width: 768px)').matches
        ? '.mobile-header-bar a[href]' : '.desktop-header-content a[href]';
      fullHeaderRef.current?.querySelector<HTMLAnchorElement>(selector)?.focus();
    });
  };

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", isMenuOpen);

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("mobile-menu-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  const goToTrial = () => {
    setIsMenuOpen(false);
    const form = document.getElementById('trial-request');
    if (form) { form.scrollIntoView({ behavior: 'smooth' }); }
    else { navigate(localizedUrl('/contact#trial-request', language)); }
  };

  return (
    <header ref={headerRef} className={`header${isMenuOpen ? ' mobile-menu-active' : ''}${isCompact ? ' header-is-compact' : ''}${revealMotion === 'slide' ? ' header-reveal-from-up' : ''}`}>
      <div id="header-navigation" ref={fullHeaderRef} className="header-full" inert={isCompact} aria-hidden={isCompact}>
      <div className="desktop-header-content">
        <div className="brand header-logo-container">
          <Link to={'/'}>
              <img src="/imgs/vortex-logo-115.svg" alt="Vortex" />
          </Link>
        </div>
        <nav aria-label={t('common.navigation')}>
          <ul className="nav-list">
            <li><Link className="nav-link" to="/">{t('nav.home')}</Link></li>
            <ServicesDropdown />
            {menuLinks.slice(1).map((link) => (
              <li key={link.path}>
                <Link className="nav-link" to={link.path}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ButtonFill
          btnFunction={goToTrial}
          btnText={t('common.tryFree')}
          dynamicClass={' orange no-icon'}
        />
        <LanguageSwitcher />
        <Link className="tcd-link nav-link" to="/tecdoc-license">
          <img
            className="tecdoc-license-link"
            src="/imgs/tecdoc-button.png"
            alt={t('common.partner')}
          />
        </Link>
      </div>

      <div className="mobile-header-content">
        <div className="mobile-header-bar">
          <Link
            className="brand header-logo-container"
            to="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <img src="/imgs/vortex-logo-115.svg" alt="Vortex" />
          </Link>
          <LanguageSwitcher />
          <button
            className={`mobile-menu-toggle${isMenuOpen ? " is-open" : ""}`}
            type="button"
            aria-label={t(isMenuOpen ? 'common.closeMenu' : 'common.openMenu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            <span aria-hidden="true" />
          </button>
        </div>

      </div>
      </div>

      <button
        ref={compactButtonRef}
        className="header-compact-trigger"
        type="button"
        aria-label={t('header.expand')}
        aria-controls="header-navigation"
        aria-expanded={!isCompact}
        aria-hidden={!isCompact}
        tabIndex={isCompact ? 0 : -1}
        onClick={(event) => expandHeader(event.detail === 0)}
      >
        <img src="/imgs/vortex-logo-115.svg" alt="Vortex" />
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>

        <div id="mobile-navigation" className="mobile-menu-panel" aria-hidden={!isMenuOpen} inert={!isMenuOpen}>
          <Link className="mobile-tecdoc-link" to="/tecdoc-license" onClick={() => setIsMenuOpen(false)}>
            <img src="/imgs/tecdoc-button.png" alt={t('common.partner')} />
          </Link>

          <nav aria-label={t('common.mobileNavigation')}>
            <ul className="mobile-nav-list">
              <ServicesDropdown onNavigate={() => setIsMenuOpen(false)} />
              {menuLinks.slice(1).map((link) => (
                <li key={link.path}>
                  <Link className="nav-link" to={link.path} onClick={() => setIsMenuOpen(false)}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-menu-cta">
            <ButtonFill
              btnFunction={goToTrial}
              btnText={t('common.tryFree')}
              dynamicClass=" orange no-icon"
            />
          </div>

          <div className="mobile-social-links" aria-label={t('common.socials')}>
            {SOCIAL_LINKS.map((link) => (
              <a key={link.name} href={link.url} aria-label={link.name} target="_blank" rel="noopener noreferrer">
                <img src={link.imageSrc} alt="" />
              </a>
            ))}
          </div>

          <Link className="mobile-privacy-link" to="/privacy-policy" onClick={() => setIsMenuOpen(false)}>
            {t('common.privacy')}
          </Link>
          <p className="mobile-copyright">{t('common.copyright', { year: new Date().getFullYear() })}</p>
        </div>
    </header>
  );
}

export default HeaderMain;
