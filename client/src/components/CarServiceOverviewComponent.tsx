import StickyHeading from './default/StickyHeading';
import ChevronCircle from './default/ChevronCircle';
import { localizedUrl } from '../seo/urls';
import { useI18n } from '../context/ContentContext';
import { useInitialContent } from '../context/ContentContext';

function CarServiceOverviewComponent() {
  const { t, language } = useI18n();
  const content = useInitialContent()?.homepage.car_service_section ?? null;

  return (
    <section className="section-container car-service-overview-section">

      {content && (
        <div className="car-service-overview-wrapper">
          <StickyHeading className="home-sticky-title">{content.heading}</StickyHeading>

          <div className="car-service-overview-banner">
            <p>{content.description}</p>
          </div>

          <div className="car-service-overview-grid">
            <div className="car-service-overview-media-column">
              <div
                className="car-service-laptop-card"
                role="img"
                aria-label={content.image_alt ?? t('carOverview.alt')}
                style={content.image !== undefined ? {backgroundImage: content.image ? `url(${JSON.stringify(content.image)})` : 'none'} : undefined}
              />

              <div className="car-service-cta-card">
                <a href={localizedUrl(content.link_target ?? '/car-service', language)}>
                  {content.link_text ?? t('carOverview.link')}
                  <ChevronCircle />
                </a>
              </div>
            </div>

            <div className="car-service-overview-content-column">
              <div className="car-service-overview-copy">
                {(content.paragraphs ?? ['first','second','third'].map(key=>t(`carOverview.${key}`))).map((p,index)=><p key={index}>{p}</p>)}
              </div>

              <div className="car-service-features-card">
                <ul className="car-service-features">
                  {content.car_service_features.map((feature, index) => (
                    <li key={`${feature}-${index}`}>
                      <img src="/imgs/sm-dark-blue-logo.svg" alt="" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CarServiceOverviewComponent;
