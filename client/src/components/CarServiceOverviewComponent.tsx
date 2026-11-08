import { useI18n } from '../context/ContentContext';
import { useInitialContent } from '../context/ContentContext';

function CarServiceOverviewComponent() {
  const { t } = useI18n();
  const content = useInitialContent()?.homepage.car_service_section ?? null;

  return (
    <section className="section-container car-service-overview-section">

      {content && (
        <div className="car-service-overview-wrapper">
          <h2>{content.heading}</h2>

          <div className="car-service-overview-banner">
            <p>{content.description}</p>
          </div>

          <div className="car-service-overview-grid">
            <div className="car-service-overview-media-column">
              <div
                className="car-service-laptop-card"
                role="img"
                aria-label={t('carOverview.alt')}
              />

              <div className="car-service-cta-card">
                <a href="/car-service">
                  {t('carOverview.link')}
                  <span aria-hidden="true">››</span>
                </a>
              </div>
            </div>

            <div className="car-service-overview-content-column">
              <div className="car-service-overview-copy">
                {['first', 'second', 'third'].map((key) => <p key={key}>{t(`carOverview.${key}`)}</p>)}
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
