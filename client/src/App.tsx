import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ContentProvider } from './context/ContentContext';
import type { VortexContent } from './types/content';

type AppProps = {
  initialContent?: VortexContent | null;
};

function App({ initialContent = null }: AppProps) {
  return (
    <ContentProvider content={initialContent}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ContentProvider>
  );
}

export default App;
