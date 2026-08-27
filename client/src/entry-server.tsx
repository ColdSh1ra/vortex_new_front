import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ContentProvider } from './context/ContentContext';
import type { VortexContent } from './types/content';

export function render(url: string, initialContent: VortexContent) {
  const appHtml = renderToString(
    <React.StrictMode>
      <ContentProvider content={initialContent}>
        <MemoryRouter initialEntries={[url]}>
          <AppRouter />
        </MemoryRouter>
      </ContentProvider>
    </React.StrictMode>,
  );

  return { appHtml };
}
