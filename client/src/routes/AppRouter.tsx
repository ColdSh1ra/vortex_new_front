import { Navigate, Route, Routes } from 'react-router-dom';
import HeaderMain from '../components/layout/HeaderMain';
import ContactPage from '../pages/ContactPage';
import FaqPage from '../pages/FaqPage';
import MainPage from '../pages/MainPage';

function AppRouter() {
  return (
    <div className="app-shell document-body main-content-container">
      <HeaderMain />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default AppRouter;
