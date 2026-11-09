import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
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
import BlogPage from '../pages/BlogPage';
import BlogArticlePage from '../pages/BlogArticlePage';
import SeoHead from '../seo/SeoHead';
import { blogLanguage } from '../blog/urls';
import { blogText } from '../blog/copy';

function AppRouter() {
  const location = useLocation();
  const { content, failed, t, language, setLanguage } = useI18n();
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');
  const hasContent = !!content;
  const isFaqPage = location.pathname === '/faq' || location.pathname.startsWith('/faq/');
  const isContactPage = location.pathname === '/contact' || location.pathname.startsWith('/contact/');
  const isCarServicePage = location.pathname === '/car-service' || location.pathname.startsWith('/car-service/');
  const isWebsitesPage = location.pathname === '/websites' || location.pathname.startsWith('/websites/');
  const isDismantlingPage = location.pathname === '/auto-dismantling' || location.pathname.startsWith('/auto-dismantling/');
  const isTecDocPage = location.pathname === '/tecdoc-license' || location.pathname.startsWith('/tecdoc-license/');
  const routeClassName = isBlog ? ' blog-route' : isFaqPage ? ' faq-route'
    : isContactPage ? ' contacts-route'
      : isCarServicePage ? ' car-service-route'
        : isWebsitesPage ? ' websites-route'
          : isDismantlingPage ? ' dismantling-route'
            : isTecDocPage ? ' tecdoc-route' : '';

  useEffect(() => {
    if (isBlog) {
      const next = blogLanguage(location.search);
      if (language !== next) setLanguage(next);
    }
  }, [location.pathname, location.search]);

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
  }, [location.pathname, location.search, location.hash, hasContent]);

  return (
    <div className={`app-shell document-body main-content-container${routeClassName}`}>
      <SeoHead />
      <HeaderMain />
      <main className="main-content">
        {!content && !isBlog ? (
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
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="*" element={<div className="blog-page blog-status"><h1>{blogText(language, 'missing')}</h1><Link to="/">{t('common.home')}</Link></div>} />
          </Routes>
        )}
      </main>
      <FooterMain />
    </div>
  );
}

export default AppRouter;
