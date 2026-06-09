import { useEffect, useState } from 'react';
import { getContent } from '../services/api';
import type { VortexContent } from '../types/content';

function MainPage() {
  const [content, setContent] = useState<VortexContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        const apiContent = await getContent();
        setContent(apiContent);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  return (
    <section className="hero-page section-container">
      <h1>Головна сторінка</h1>
      {isLoading && <p>Іде завантаження...</p>}
      {error && <p>Невдалось завантажити сторінку: {error}</p>}
      {content && (
        <>
          <h2>{content.homepage.title}</h2>
          <p>{content.homepage.subtitle}</p>
          <p>Total clicks: {content.stats.totalClicks}</p>
          <p>Form submissions: {content.stats.formSubmissions}</p>
        </>
      )}
    </section>
  );
}

export default MainPage;
