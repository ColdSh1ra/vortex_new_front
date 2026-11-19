import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import { loadPageStyles } from './styles/loadPageStyles';
import { languageFromSearch } from './seo/urls';
import { captureUtm } from './utils/utm';

captureUtm();

async function startApplication() {
  await loadPageStyles(window.location.pathname);

  const rootElement = document.getElementById('root')!;
  const application = (
    <React.StrictMode>
      <App initialPreview={window.__VORTEX_PREVIEW__ === true} initialContent={window.__VORTEX_CONTENT__ ?? null} initialLanguage={languageFromSearch(window.location.search)} initialBlog={window.__VORTEX_BLOG__ ?? null} />
    </React.StrictMode>
  );

  if (window.__VORTEX_CONTENT__) {
    hydrateRoot(rootElement, application);
  } else {
    createRoot(rootElement).render(application);
  }
}

void startApplication();
