import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ContentProvider } from './context/ContentContext';
import type { ContentCatalog, Language } from './types/content';

type AppProps = {
  initialContent?: ContentCatalog | null;
  initialLanguage?: Language;
};

function App({ initialContent = null, initialLanguage = 'ua' }: AppProps) {
  return (
    <ContentProvider content={initialContent} initialLanguage={initialLanguage}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ContentProvider>
  );
}

export default App;
