import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App initialContent={window.__VORTEX_CONTENT__ ?? null} />
  </React.StrictMode>,
);
