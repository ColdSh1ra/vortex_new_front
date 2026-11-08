import { useInitialContent } from '../../context/ContentContext';

const BLANK_IMAGE_VALUE = 'blank_image';

function IntegrationsCatalogComponent() {
  const content = useInitialContent()?.homepage.integrations_catalog_section ?? null;

  return (
    <section className="section-container integrations-catalog-section" id="integrations-catalog">

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
                    {hasImage && <img src={card.image_src} alt={card.title} />}
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
