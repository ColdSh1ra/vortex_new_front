import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import { loadPageStyles } from './styles/loadPageStyles';

async function startApplication() {
  await loadPageStyles(window.location.pathname);

  const rootElement = document.getElementById('root')!;
  const application = (
    <React.StrictMode>
      <App initialContent={window.__VORTEX_CONTENT__ ?? null} initialLanguage={window.__VORTEX_LANGUAGE__ ?? 'ua'} />
    </React.StrictMode>
  );

  if (window.__VORTEX_CONTENT__) {
    hydrateRoot(rootElement, application);
  } else {
    createRoot(rootElement).render(application);
  }
}

void startApplication();
