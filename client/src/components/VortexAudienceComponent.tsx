import { useEffect, useState } from 'react';
import { useInitialContent } from '../context/ContentContext';
import { getHomepageContent } from '../services/api';
import type { VortexAudienceSection } from '../types/content';

function VortexAudienceComponent() {
  const initialContent = useInitialContent()?.homepage.vortex_audience_section ?? null;
  const [content, setContent] = useState<VortexAudienceSection | null>(initialContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      return;
    }

    getHomepageContent('vortex_audience_section')
      .then(setContent)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      });
  }, [content]);

  return (
    <section className="section-container vortex-audience-section">
      <div className="radial-bg-container" aria-hidden="true" />
      {error && <p className="audience-status">{error}</p>}
      {content && (
        <div className="vortex-audience-wrapper">
          <h2>{content.section_title}</h2>
          <div className="audience-grid">
            {content.cards.map((card, index) => (
              <article className="audience-card" key={`${card.title}-${index}`}>
                <div className="audience-card-content">
                  <span>{index + 1}/</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <button type="button">
                    {card.cta_text}
                    <b aria-hidden="true">››</b>
                  </button>
                </div>
                <div className="audience-image-frame">
                  {card.image_src && <img src={card.image_src} alt="" />}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default VortexAudienceComponent;
