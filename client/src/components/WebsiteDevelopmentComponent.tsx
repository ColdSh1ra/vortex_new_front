import { useEffect, useState } from 'react';
import { useInitialContent } from '../context/ContentContext';
import { getHomepageContent } from '../services/api';
import type { WebsiteDevelopmentSection } from '../types/content';

function WebsiteDevelopmentComponent() {
  const initialContent = useInitialContent()?.homepage.website_development_section ?? null;
  const [content, setContent] = useState<WebsiteDevelopmentSection | null>(initialContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      return;
    }

    getHomepageContent('website_development_section')
      .then(setContent)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      });
  }, [content]);

  return (
    <section className="section-container website-development-section">
      {error && <p className="website-development-status">{error}</p>}

      {content && (
        <div className="website-development-wrapper">
          <h2 className="website-development-title">{content.heading}</h2>

          <div className="website-development-gift-banner">
            <p>{content.gift_message}</p>
            <img src="/imgs/3dicons_premium/3d-gift-large.png" alt="" aria-hidden="true" />
          </div>

          <div className="website-development-showcase">
            <div className="website-development-preview-card">
              <img
                src={content.website_image_src}
                alt="Приклад шаблонного сайту магазину автозапчастин"
              />
            </div>

            <div className="website-development-details">
              <div className="website-development-description">
                {content.description_paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="website-development-benefits">
                {content.benefit_groups.map((group) => (
                  <article className="website-development-benefit-card" key={group.image_src}>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>
                          <img src="/imgs/sm-dark-blue-logo.svg" alt="" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {group.note && <small>{group.note}</small>}
                    <img className="website-development-benefit-image" src={group.image_src} alt="" aria-hidden="true" />
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="website-development-upgrade-banner">
            <span className="website-development-bolt" aria-hidden="true" />
            <p>{content.upgrade_message}</p>
          </div>

          <div className="website-development-cta">
            <a href="/websites">
              {content.cta_text}
              <span aria-hidden="true">
                <img src="/icons/chevron-right-double.svg" alt="" />
              </span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

export default WebsiteDevelopmentComponent;
