import { useEffect, useState } from 'react';
import { useInitialContent } from '../context/ContentContext';
import { getHomepageContent } from '../services/api';
import type { CarServiceSection } from '../types/content';

function CarServiceOverviewComponent() {
  const initialContent = useInitialContent()?.homepage.car_service_section ?? null;
  const [content, setContent] = useState<CarServiceSection | null>(initialContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      return;
    }

    getHomepageContent('car_service_section')
      .then(setContent)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Unknown error');
      });
  }, [content]);

  return (
    <section className="section-container car-service-overview-section">
      {error && <p className="car-service-overview-status">{error}</p>}

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
                aria-label="Інтерфейс обліку СТО Vortex на ноутбуці"
              />

              <div className="car-service-cta-card">
                <a href="/car-service">
                  Детальніше про облік СТО
                  <span aria-hidden="true">››</span>
                </a>
              </div>
            </div>

            <div className="car-service-overview-content-column">
              <div className="car-service-overview-copy">
                <p>
                  Так як ми самі є власниками сервісу ТО, то при розробці даного модулю
                  спирались на власний досвід роботи, з усіма його проблемами та нюансами.
                </p>
                <p>
                  Пізніше, коли ми почали дистриб’ювати програму іншим СТО по Україні,
                  їхній підхід до роботи та бачення системи обліку СТО ми врахували під
                  час розробки продукту.
                </p>
                <p>
                  Так само і ви, коли приєднаєтесь, будете допомагати нам створити найкращу
                  систему обліку для СТО та магазинів автозапчастин.
                </p>
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
