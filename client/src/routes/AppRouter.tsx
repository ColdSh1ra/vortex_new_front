import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HeaderMain from '../components/layout/HeaderMain';
import ContactPage from '../pages/ContactPage';
import FaqPage from '../pages/FaqPage';
import MainPage from '../pages/MainPage';
import FooterMain from "../components/layout/FooterMain";
import CarServicePage from "../pages/CarServicePage";
import { loadPageStyles } from '../styles/loadPageStyles';

function AppRouter() {
  const location = useLocation();
  const isFaqPage = location.pathname === '/faq' || location.pathname.startsWith('/faq/');
  const isContactPage = location.pathname === '/contact' || location.pathname.startsWith('/contact/');
  const routeClassName = isFaqPage ? ' faq-route' : isContactPage ? ' contacts-route' : '';

  useEffect(() => {
    void loadPageStyles(location.pathname);
  }, [location.pathname]);

  return (
    <div className={`app-shell document-body main-content-container${routeClassName}`}>
      <HeaderMain />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/contact" element={<ContactPage />} />

            <Route path="/car-service" element={<CarServicePage/>} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
        <FooterMain/>
    </div>
  );
}

export default AppRouter;
