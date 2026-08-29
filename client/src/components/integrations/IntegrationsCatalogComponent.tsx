import { useEffect, useState } from 'react';
import { useInitialContent } from '../../context/ContentContext';
import { getHomepageContent } from '../../services/api';
import type { IntegrationsCatalogSection } from '../../types/content';

const BLANK_IMAGE_VALUE = 'blank_image';

function IntegrationsCatalogComponent() {
  const initialContent = useInitialContent()?.homepage.integrations_catalog_section ?? null;
  const [content, setContent] = useState<IntegrationsCatalogSection | null>(initialContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      return;
    }

    getHomepageContent('integrations_catalog_section')
      .then(setContent)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      });
  }, [content]);

  return (
    <section className="section-container integrations-catalog-section" id="integrations-catalog">
      {error && <p className="integrations-catalog-status">{error}</p>}

      {content && (
        <div className="integrations-catalog-wrapper">
          <header className="integrations-catalog-header">
            <h2>{content.section_title}</h2>
            <p>{content.section_description}</p>
          </header>

          <div className="integrations-catalog-grid">
            {content.cards.map((card, index) => {
              const hasImage = Boolean(card.image_src && card.image_src !== BLANK_IMAGE_VALUE);

              return (
                <article className="integration-catalog-card" key={`${card.title}-${index}`}>
                  <div
                    className={`integration-catalog-logo${hasImage ? '' : ' is-placeholder'}`}
                    aria-hidden={!hasImage}
                  >
                    {hasImage && <img src={card.image_src} alt={`${card.title} logo`} />}
                  </div>

                  <h3>{card.title}</h3>

                  <ul className="integration-catalog-features">
                    {card.features.map((feature, featureIndex) => (
                      <li key={`${feature}-${featureIndex}`}>{feature}</li>
                    ))}
                  </ul>

                  <a className="integration-catalog-link" href={card.link_href}>
                    {card.link_text}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default IntegrationsCatalogComponent;
