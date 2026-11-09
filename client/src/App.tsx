import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ContentProvider } from './context/ContentContext';
import type { ContentCatalog, Language } from './types/content';
import { BlogProvider } from './blog/BlogContext';
import type { BlogResource } from './blog/types';

type AppProps = {
  initialContent?: ContentCatalog | null;
  initialLanguage?: Language;
  initialBlog?: BlogResource | null;
};

function App({ initialContent = null, initialLanguage = 'ua', initialBlog = null }: AppProps) {
  return (
    <ContentProvider content={initialContent} initialLanguage={initialLanguage}>
      <BrowserRouter>
        <BlogProvider initialData={initialBlog}><AppRouter /></BlogProvider>
      </BrowserRouter>
    </ContentProvider>
  );
}

export default App;
