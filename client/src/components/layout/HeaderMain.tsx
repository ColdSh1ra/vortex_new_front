import { useI18n } from '../../context/ContentContext';
import LanguageSwitcher from './LanguageSwitcher';
import ServicesDropdown from './ServicesDropdown';
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Link from '../default/LocalizedLink';
import type { CSSProperties } from 'react';
import HeaderSectionTitle from './HeaderSectionTitle';
import { useActiveSectionHeading } from '../../utils/useActiveSectionHeading';
import type { NavigationLink } from "../../types/navigation";
import ButtonFill from "../default/ButtonFIll";
import { blogUrl } from '../../blog/urls';
import { localizedUrl } from '../../seo/urls';
import { SOCIAL_LINKS } from '../../data/socialLinks';
import { isCmsTargetVisible, visibleCmsMenu } from '../../utils/cmsContent';
import type { CmsMenuItem } from '../../types/cmsContent';

function getMenuLinks(t: (key: string) => string, pricingPath: string, blogPath: string): NavigationLink[] { return [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.pricing"), path: pricingPath },
    { name: t("nav.faq"), path: "/faq" },
    { name: t("nav.blog"), path: blogPath },
    { name: t("nav.contacts"), path: "/contact" },
]; }


function HeaderMain() {
  const { t, language, content } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const [titleWidth, setTitleWidth] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const fullHeaderRef = useRef<HTMLDivElement>(null);
  const compactButtonRef = useRef<HTMLButtonElement>(null);
  const compactRef = useRef(false);
  const scheduleClearance = useRef<() => void>(() => {});
  const location = useLocation();
  const activeHeading = useActiveSectionHeading(location.pathname + ':' + language);
  const isCompact = !isAtTop && !isHovered && !isPinnedOpen && !hasKeyboardFocus && !isMenuOpen;
  compactRef.current = isCompact;
  const pricingPath = ['/car-service', '/websites'].includes(location.pathname)
    ? `${location.pathname}#pricing` : '/#pricing';
  const menuLinks = getMenuLinks(t, pricingPath, blogUrl(language));
  const navigate = useNavigate();
  const layout = content?.layout;
  const defaultMenu: CmsMenuItem[] = [
    {id:'home',label:t('nav.home'),target:'/'},
    {id:'services',label:t('nav.services'),children:[
      {id:'car-service',label:t('nav.carService'),target:'/car-service'},
      {id:'websites',label:t('nav.websites'),target:'/websites'},
      {id:'autoshrot',label:t('nav.dismantling'),target:'/auto-dismantling'},
      {id:'tecdoc',label:t('nav.tecdoc'),target:'/tecdoc-license'},
    ]},
    ...menuLinks.slice(1).map(link=>({id:link.path,label:link.name,target:link.path})),
  ];
  const headerMenu = visibleCmsMenu(content, layout ? (layout.header_menu ?? layout.menu) : defaultMenu);
  const logo = layout ? layout.header_logo : '/imgs/vortex-logo-115.svg';
  const logoAlt = layout ? layout.header_logo_alt : 'Vortex';
  const ctaText = layout ? layout.buttons.try_free_text : t('common.tryFree');
  const ctaTarget = layout?.buttons.try_free_target;
  const partners = (layout ? layout.partner_images : [{image:'/imgs/tecdoc-button.png',alt:t('common.partner'),url:'/tecdoc-license'}])
    .filter(partner => partner.image && partner.url && isCmsTargetVisible(content, partner.url));
  const socials = layout ? layout.socials.map(social=>({name:social.label,url:social.url,imageSrc:social.icon})) : SOCIAL_LINKS;
  const privacyTarget = layout ? layout.privacy_link : '/privacy-policy';
  const privacyText = layout ? layout.privacy_text : t('common.privacy');
  const renderMenu = (mobile = false) => headerMenu.map(item => item.children
    ? <ServicesDropdown key={item.id} label={item.label} items={item.children.map(child=>({name:child.label,path:child.target!}))} onNavigate={mobile ? () => setIsMenuOpen(false) : undefined} />
    : <li key={item.id}><Link className="nav-link" to={item.target!} onClick={mobile ? () => setIsMenuOpen(false) : undefined}>{item.label}</Link></li>);


  useEffect(() => {
    setIsMenuOpen(false);
    setIsHovered(false);
    setIsPinnedOpen(false);
    setHasKeyboardFocus(false);
    setIsAtTop(window.scrollY <= 1);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let frame: number | null = null;
    let lastY = window.scrollY;
    const measure = () => {
      frame = null;
      const y = Math.max(0, window.scrollY);
      setIsAtTop(y <= 1);
      if (Math.abs(y - lastY) > 1) setIsPinnedOpen(false);
      lastY = y;
    };
    const schedule = () => { if (frame === null) frame = window.requestAnimationFrame(measure); };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsPinnedOpen(false);
        setIsMenuOpen(false);
        setHasKeyboardFocus(false);
      }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('pointerdown', closeOutside);
    measure();
    return () => {
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('pointerdown', closeOutside);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  // The full panel retains its layout height, so expanding never shifts content.
  // Clearance is still used by anchor links, not by pinned section headings.
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
    const observer = new ResizeObserver(schedule);
    for (const element of [headerRef.current, fullHeaderRef.current, compactButtonRef.current]) {
      if (element) observer.observe(element);
    }
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
      scheduleClearance.current = () => {};
      if (previous) root.style.setProperty('--site-header-clearance', previous);
      else root.style.removeProperty('--site-header-clearance');
    };
  }, []);

  useEffect(() => { scheduleClearance.current(); }, [isCompact]);

  const expandHeader = useCallback((keyboard: boolean) => {
    setIsPinnedOpen(true);
    if (keyboard) window.requestAnimationFrame(() => {
      const selector = window.matchMedia('(max-width: 768px)').matches
        ? '.mobile-header-bar a[href]' : '.desktop-header-content a[href]';
      fullHeaderRef.current?.querySelector<HTMLAnchorElement>(selector)?.focus();
    });
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', isMenuOpen);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMenuOpen(false);
      setIsPinnedOpen(false);
      setIsHovered(false);
      setHasKeyboardFocus(false);
      if (window.scrollY > 1 && headerRef.current?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('mobile-menu-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  const goToTrial = () => {
    setIsMenuOpen(false);
    if (layout && !ctaTarget) return;
    if (ctaTarget && ctaTarget !== '#trial-request') {
      if (ctaTarget.startsWith('#')) {
        document.getElementById(ctaTarget.slice(1))?.scrollIntoView({behavior:'smooth'});
      } else if (/^(https:|mailto:|tel:)/.test(ctaTarget)) window.location.assign(ctaTarget);
      else navigate(localizedUrl(ctaTarget, language));
      return;
    }
    const form = document.getElementById('trial-request');
    if (form) { form.scrollIntoView({ behavior: 'smooth' }); }
    else { navigate(localizedUrl('/contact#trial-request', language)); }
  };

  return (
    <header
      ref={headerRef}
      className={`header${isMenuOpen ? ' mobile-menu-active' : ''}${isCompact ? ' header-is-compact' : ''}`}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLElement && fullHeaderRef.current?.contains(event.target)
          && event.target.matches(':focus-visible')) setHasKeyboardFocus(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHasKeyboardFocus(false);
          setIsPinnedOpen(false);
        }
      }}
    >
      <div id="header-navigation" ref={fullHeaderRef} className="header-full" onPointerEnter={(event) => { if (event.pointerType === 'mouse' && !isCompact) setIsHovered(true); }} inert={isCompact} aria-hidden={isCompact}>
      <div className="desktop-header-content">
        <div className="brand header-logo-container">
          <Link to={'/'}>
              {logo && <img src={logo} alt={logoAlt} />}
          </Link>
        </div>
        <nav aria-label={t('common.navigation')}>
          <ul className="nav-list">
            {renderMenu()}
          </ul>
        </nav>
        {ctaText && (!layout || ctaTarget) && <ButtonFill
          btnFunction={goToTrial}
          btnText={ctaText}
          dynamicClass={' orange no-icon'}
        />}
        <LanguageSwitcher />
        {partners.map(partner=><Link key={partner.image} className="tcd-link nav-link" to={partner.url}><img className="tecdoc-license-link" src={partner.image} alt={partner.alt} /></Link>)}
      </div>

      <div className="mobile-header-content">
        <div className="mobile-header-bar">
          <Link
            className="brand header-logo-container"
            to="/"
            onClick={() => setIsMenuOpen(false)}
          >
            {logo && <img src={logo} alt={logoAlt} />}
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
        style={{ '--header-title-width': `${titleWidth}px` } as CSSProperties}
        data-has-heading={!!activeHeading}
        aria-label={activeHeading ? `${activeHeading.text}. ${t('header.expand')}` : t('header.expand')}
        aria-controls="header-navigation"
        aria-expanded={!isCompact}
        aria-hidden={!isCompact}
        tabIndex={isCompact ? 0 : -1}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') setIsHovered(true); }}
        onClick={(event) => expandHeader(event.detail === 0)}
      >
        {logo && <img src={logo} alt={logoAlt} />}
        <HeaderSectionTitle heading={activeHeading} onWidthChange={setTitleWidth} />
      </button>

        <div id="mobile-navigation" className="mobile-menu-panel" aria-hidden={!isMenuOpen} inert={!isMenuOpen}>
          {partners.map(partner=><Link key={partner.image} className="mobile-tecdoc-link" to={partner.url} onClick={()=>setIsMenuOpen(false)}><img src={partner.image} alt={partner.alt} /></Link>)}

          <nav aria-label={t('common.mobileNavigation')}>
            <ul className="mobile-nav-list">
              {renderMenu(true)}
            </ul>
          </nav>

          <div className="mobile-menu-cta">
            {ctaText && (!layout || ctaTarget) && <ButtonFill
              btnFunction={goToTrial}
              btnText={ctaText}
              dynamicClass=" orange no-icon"
            />}
          </div>

          <div className="mobile-social-links" aria-label={t('common.socials')}>
            {socials.filter(link=>link.url).map((link) => (
              <a key={link.name} href={link.url} aria-label={link.name} target="_blank" rel="noopener noreferrer">
                <img src={link.imageSrc} alt="" />
              </a>
            ))}
          </div>

          {privacyTarget && isCmsTargetVisible(content, privacyTarget) && <Link className="mobile-privacy-link" to={privacyTarget} onClick={() => setIsMenuOpen(false)}>{privacyText}</Link>}
          <p className="mobile-copyright">{t('common.copyright', { year: new Date().getFullYear() })}</p>
        </div>
    </header>
  );
}

export default HeaderMain;
