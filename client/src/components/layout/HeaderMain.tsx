import { useI18n } from '../../context/ContentContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { NavigationLink } from "../../types/navigation";
import ButtonFill from "../default/ButtonFIll";

function getMenuLinks(t: (key: string) => string, pricingPath: string): NavigationLink[] { return [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.carService"), path: "/car-service" },
    { name: t("nav.websites"), path: "/websites" },
    { name: t("nav.pricing"), path: pricingPath },
    { name: t("nav.faq"), path: "/faq" },
    { name: t("nav.contacts"), path: "/contact" },
]; }

const socialLinks = [
  { name: "Facebook", path: "/", icon: "/icons/sm_black/facebook.svg" },
  { name: "YouTube", path: "/", icon: "/icons/sm_black/youtube.svg" },
  { name: "Telegram", path: "/", icon: "/icons/sm_black/telegram.svg" },
  { name: "Instagram", path: "/", icon: "/icons/sm_black/instagram.svg" },
];

function HeaderMain() {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollAnimationFrame = useRef<number | null>(null);
  const location = useLocation();
  const pricingPath = ['/car-service', '/websites'].includes(location.pathname)
    ? `${location.pathname}#pricing` : '/#pricing';
  const menuLinks = getMenuLinks(t, pricingPath);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsHeaderVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    setIsHeaderVisible(true);
    lastScrollY.current = Math.max(window.scrollY, 0);

    if (isMenuOpen) {
      return;
    }

    const handleScroll = () => {
      if (scrollAnimationFrame.current !== null) {
        return;
      }

      scrollAnimationFrame.current = window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const scrollDifference = currentScrollY - lastScrollY.current;

        if (currentScrollY <= 24) {
          setIsHeaderVisible(true);
        } else if (scrollDifference > 6) {
          setIsHeaderVisible(false);
        } else if (scrollDifference < -6) {
          setIsHeaderVisible(true);
        }

        if (Math.abs(scrollDifference) > 6 || currentScrollY <= 24) {
          lastScrollY.current = currentScrollY;
        }

        scrollAnimationFrame.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (scrollAnimationFrame.current !== null) {
        window.cancelAnimationFrame(scrollAnimationFrame.current);
        scrollAnimationFrame.current = null;
      }
    };
  }, [isMenuOpen]);

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
    else { navigate('/contact#trial-request'); }
  };

  return (
    <header className={`header${isMenuOpen ? " mobile-menu-active" : ""}${isHeaderVisible ? "" : " header-is-hidden"}`}>
      <div className="desktop-header-content">
        <div className="brand header-logo-container">
          <Link to={'/'}>
              <img src="/imgs/vortex-logo-115.svg" alt="Vortex" />
          </Link>
        </div>
        <nav aria-label={t('common.navigation')}>
          <ul className="nav-list">
            {menuLinks.map((link) => (
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

        <div id="mobile-navigation" className="mobile-menu-panel" aria-hidden={!isMenuOpen}>
          <Link className="mobile-tecdoc-link" to="/tecdoc-license" onClick={() => setIsMenuOpen(false)}>
            <img src="/imgs/tecdoc-button.png" alt={t('common.partner')} />
          </Link>

          <nav aria-label={t('common.mobileNavigation')}>
            <ul className="mobile-nav-list">
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
            {socialLinks.map((link) => (
              <Link key={link.name} to={link.path} aria-label={link.name}>
                <img src={link.icon} alt="" />
              </Link>
            ))}
          </div>

          <Link className="mobile-privacy-link" to="/privacy-policy" onClick={() => setIsMenuOpen(false)}>
            {t('common.privacy')}
          </Link>
          <p className="mobile-copyright">{t('common.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </header>
  );
}

export default HeaderMain;
