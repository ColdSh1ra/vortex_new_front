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

export { loadBlogRoute };
export function render(url: string, initialContent: ContentCatalog, language: Language = 'ua', initialBlog: BlogResource | null = null) {
  const appHtml = renderToString(
    <React.StrictMode>
      <ContentProvider content={initialContent} initialLanguage={language}>
        <MemoryRouter initialEntries={[url]}>
          <BlogProvider initialData={initialBlog}><AppRouter /></BlogProvider>
        </MemoryRouter>
      </ContentProvider>
    </React.StrictMode>,
  );

  const seo = buildPageSeo(url, language, initialBlog);
  return { appHtml, headHtml: renderSeoHead(seo), statusCode: seo.status, robots: seo.robots };
}
