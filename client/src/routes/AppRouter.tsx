import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HeaderMain from '../components/layout/HeaderMain';
import FooterMain from '../components/layout/FooterMain';
import ContactPage from '../pages/ContactPage';
import FaqPage from '../pages/FaqPage';
import MainPage from '../pages/MainPage';
import CarServicePage from '../pages/CarServicePage';
import WebsiteDevelopmentPage from '../pages/WebsiteDevelopmentPage';
import AutoDismantlingPage from '../pages/AutoDismantlingPage';
import TecDocLicensePage from '../pages/TecDocLicensePage';
import { useI18n } from '../context/ContentContext';
import { loadPageStyles } from '../styles/loadPageStyles';

function AppRouter() {
  const location = useLocation();
  const { content, failed, t } = useI18n();
  const hasContent = !!content;
  const isFaqPage = location.pathname === '/faq' || location.pathname.startsWith('/faq/');
  const isContactPage = location.pathname === '/contact' || location.pathname.startsWith('/contact/');
  const isCarServicePage = location.pathname === '/car-service' || location.pathname.startsWith('/car-service/');
  const isWebsitesPage = location.pathname === '/websites' || location.pathname.startsWith('/websites/');
  const isDismantlingPage = location.pathname === '/auto-dismantling' || location.pathname.startsWith('/auto-dismantling/');
  const isTecDocPage = location.pathname === '/tecdoc-license' || location.pathname.startsWith('/tecdoc-license/');
  const routeClassName = isFaqPage ? ' faq-route'
    : isContactPage ? ' contacts-route'
      : isCarServicePage ? ' car-service-route'
        : isWebsitesPage ? ' websites-route'
          : isDismantlingPage ? ' dismantling-route'
            : isTecDocPage ? ' tecdoc-route' : '';

  useEffect(() => {
    let active = true;
    const styles = loadPageStyles(location.pathname);
    if (location.hash) {
      void styles.then(() => {
        window.requestAnimationFrame(() => {
          if (active) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        });
      });
    } else {
      window.scrollTo(0, 0);
    }
    return () => { active = false; };
  }, [location.pathname, location.hash, hasContent]);

  return (
    <div className={`app-shell document-body main-content-container${routeClassName}`}>
      <HeaderMain />
      <main className="main-content">
        {!content ? (
          <p className="content-status" role="status">{t(failed ? 'common.loadError' : 'common.loading')}</p>
        ) : (
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/car-service" element={<CarServicePage />} />
            <Route path="/websites" element={<WebsiteDevelopmentPage />} />
            <Route path="/auto-dismantling" element={<AutoDismantlingPage />} />
            <Route path="/tecdoc-license" element={<TecDocLicensePage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <FooterMain />
    </div>
  );
}

export default AppRouter;
