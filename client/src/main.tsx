import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import { loadPageStyles } from './styles/loadPageStyles';

async function startApplication() {
  await loadPageStyles(window.location.pathname);

  hydrateRoot(
    document.getElementById('root')!,
    <React.StrictMode>
      <App initialContent={window.__VORTEX_CONTENT__ ?? null} />
    </React.StrictMode>,
  );
}

void startApplication();
