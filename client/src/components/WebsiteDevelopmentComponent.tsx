import { useI18n } from '../context/ContentContext';
import { useInitialContent } from '../context/ContentContext';

function WebsiteDevelopmentComponent() {
  const { t } = useI18n();
  const content = useInitialContent()?.homepage.website_development_section ?? null;

  return (
    <section className="section-container website-development-section" id="website-development">

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
                alt={t('website.alt')}
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
