import { useEffect, useReducer, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Link from '../components/default/LocalizedLink';
import HeaderMain from '../components/layout/HeaderMain';
import CmsPreviewNotice from '../components/layout/CmsPreviewNotice';
import FooterMain from '../components/layout/FooterMain';
import ContactPage from '../pages/ContactPage';
import FaqPage from '../pages/FaqPage';
import MainPage from '../pages/MainPage';
import CarServicePage from '../pages/CarServicePage';
import WebsiteDevelopmentPage from '../pages/WebsiteDevelopmentPage';
import AutoDismantlingPage from '../pages/AutoDismantlingPage';
import TecDocLicensePage from '../pages/TecDocLicensePage';
import IntegrationPage from '../pages/IntegrationPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import { useI18n } from '../context/ContentContext';
import { arePageStylesReady, loadPageStyles } from '../styles/loadPageStyles';
import PageSkeleton from '../components/layout/PageSkeleton';
import BlogPage from '../pages/BlogPage';
import BlogArticlePage from '../pages/BlogArticlePage';
import SeoHead from '../seo/SeoHead';
import { blogText } from '../blog/copy';

function AppRouter() {
  const location = useLocation();
  const { content, failed, t, language } = useI18n();
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');
  const hasContent = !!content;
  const isFaqPage = location.pathname === '/faq' || location.pathname.startsWith('/faq/');
  const isContactPage = location.pathname === '/contact' || location.pathname.startsWith('/contact/');
  const isCarServicePage = location.pathname === '/car-service' || location.pathname.startsWith('/car-service/');
  const isWebsitesPage = location.pathname === '/websites' || location.pathname.startsWith('/websites/');
  const isDismantlingPage = location.pathname === '/auto-dismantling' || location.pathname.startsWith('/auto-dismantling/');
  const isTecDocPage = location.pathname === '/tecdoc-license' || location.pathname.startsWith('/tecdoc-license/');
  const isIntegrationPage = location.pathname.startsWith('/integrations/');
  const isPrivacyPage = location.pathname === '/privacy-policy' || location.pathname === '/privacy-policy/';
  const routeClassName = isBlog ? ' blog-route' : isFaqPage ? ' faq-route'
    : isContactPage ? ' contacts-route'
      : isCarServicePage ? ' car-service-route'
        : isWebsitesPage ? ' websites-route'
          : isDismantlingPage ? ' dismantling-route'
            : isTecDocPage ? ' tecdoc-route'
              : isIntegrationPage ? ' integration-route'
                : isPrivacyPage ? ' privacy-route'
                  : location.pathname === '/' ? ' home-route' : '';

  // A page is rendered only once its route styles are applied; until then a skeleton
  // stands in, so the visitor never sees unstyled content during navigation.
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const stylesReady = arePageStylesReady(location.pathname);
  // The first page arrives server-rendered; only later navigations animate in.
  const initialPath = useRef(location.pathname);
  const animateEntry = location.pathname !== initialPath.current;
  if (animateEntry) initialPath.current = '';

  useEffect(() => {
    let active = true;
    const styles = loadPageStyles(location.pathname);
    if (!arePageStylesReady(location.pathname)) {
      void styles.catch(() => undefined).then(() => { if (active) rerender(); });
    }
    if (!location.hash) window.scrollTo(0, 0);
    return () => { active = false; };
  }, [location.pathname, location.search, location.hash, hasContent]);

  useEffect(() => {
    if (!location.hash || !stylesReady) return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search, location.hash, hasContent, stylesReady]);

  const skeletonVariant = isBlog ? 'blog' : location.pathname === '/' ? 'dark' : 'light';

  return (
    <div className={`app-shell document-body main-content-container${routeClassName}`}>
      <SeoHead />
      <HeaderMain />
      <main className="main-content">
        {!content && !isBlog && !isPrivacyPage && failed ? (
          <p className="content-status" role="status">{t('common.loadError')}</p>
        ) : (!content && !isBlog && !isPrivacyPage) || !stylesReady ? (
          <PageSkeleton variant={skeletonVariant} label={t('common.loading')} />
        ) : (
          <div key={location.pathname} className={animateEntry ? 'route-view route-view-enter' : 'route-view'}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/car-service" element={<CarServicePage />} />
            <Route path="/websites" element={<WebsiteDevelopmentPage />} />
            <Route path="/auto-dismantling" element={<AutoDismantlingPage />} />
            <Route path="/tecdoc-license" element={<TecDocLicensePage />} />
            <Route path="/integrations/:slug" element={<IntegrationPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/preview/:id" element={<BlogArticlePage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="*" element={<div className="blog-page blog-status"><h1>{blogText(language, 'missing')}</h1><Link to="/">{t('common.home')}</Link></div>} />
          </Routes>
          </div>
        )}
        {isBlog && <div className="blog-bottom-transition" aria-hidden="true" />}
      </main>
      <FooterMain />
      <CmsPreviewNotice />
    </div>
  );
}

export default AppRouter;
