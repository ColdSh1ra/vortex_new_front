import StickyHeading from './default/StickyHeading';
import ChevronCircle from './default/ChevronCircle';
import { imageSize } from '../utils/imageSize';
import { localizedUrl } from '../seo/urls';
import { useI18n } from '../context/ContentContext';
import { useInitialContent } from '../context/ContentContext';

function WebsiteDevelopmentComponent() {
  const { t, language } = useI18n();
  const content = useInitialContent()?.homepage.website_development_section ?? null;

  return (
    <section className="section-container website-development-section" id="website-development">

      {content && (
        <div className="website-development-wrapper">
          <StickyHeading className="website-development-title home-sticky-title">{content.heading}</StickyHeading>

          <div className="website-development-gift-banner">
            <p>{content.gift_message}</p>
            <img src="/imgs/3dicons_premium/3d-gift-large.png" alt="" aria-hidden="true" />
          </div>

          <div className="website-development-showcase">
            <div className="website-development-preview-card">
              <img
                src={content.website_image_src}
                {...imageSize(content.website_image_src)}
                loading="lazy" decoding="async"
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
                    <img className="website-development-benefit-image" src={group.image_src} {...imageSize(group.image_src)} loading="lazy" decoding="async" alt="" aria-hidden="true" />
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
            <a href={localizedUrl('/websites', language)}>
              {content.cta_text}
              <ChevronCircle />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

export default WebsiteDevelopmentComponent;
