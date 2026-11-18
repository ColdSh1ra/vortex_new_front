import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ContentProvider } from './context/ContentContext';
import type { ContentCatalog, Language } from './types/content';
import { BlogProvider } from './blog/BlogContext';
import type { BlogResource } from './blog/types';
import { loadBlogRoute } from './blog/loadBlogRoute';
import { buildPageSeo, renderSeoHead } from './seo/metadata';
import { languageFromSearch } from './seo/urls';

export { loadBlogRoute };
export function render(url: string, initialContent: ContentCatalog, _language: Language = 'ua', initialBlog: BlogResource | null = null, preview = false) {
  const language = languageFromSearch(new URL(url, 'https://crm-vortex.com').search);
  const appHtml = renderToString(
    <React.StrictMode>
      <MemoryRouter initialEntries={[url]}>
        <ContentProvider content={initialContent} initialLanguage={language} preview={preview}>
          <BlogProvider initialData={initialBlog}><AppRouter /></BlogProvider>
        </ContentProvider>
      </MemoryRouter>
    </React.StrictMode>,
  );

  const seo = buildPageSeo(url, language, initialBlog, initialContent, preview);
  return { appHtml, headHtml: renderSeoHead(seo), statusCode: seo.status, robots: seo.robots };
}
