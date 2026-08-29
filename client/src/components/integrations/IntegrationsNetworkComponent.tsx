import { useEffect, useState } from 'react';
import IntegrationBranch from './IntegrationBranch';
import { INTEGRATION_HUB_POSITION, integrations } from './integrationData';

function IntegrationsNetworkComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && window.location.hash === '#integrations') {
      document.getElementById('integrations')?.scrollIntoView();
    }
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <section className="section-container integrations-network-section" id="integrations">
      <header className="integrations-network-header">
        <h2>Усі постачальники в одному місці</h2>
        <p>
          Одним з основних завдань Vortex є агрегація наявностей усіх постачальників
          в одному місці, а також спрощення співпраці з ними. У рамках цих інтеграцій
          ви матимете можливість автоматично отримувати прайси постачальників,
          оформляти замовлення та завантажувати накладні за допомогою API.
        </p>
      </header>

      <div
        className="integrations-network-map"
        role="img"
        aria-label="Постачальники, підключені до системи Vortex"
      >
        <div className="integrations-network-glow" aria-hidden="true" />

        {integrations.map((integration) => (
          <IntegrationBranch
            integration={integration}
            hubX={INTEGRATION_HUB_POSITION.x}
            hubY={INTEGRATION_HUB_POSITION.y}
            key={integration.name}
          />
        ))}

        <div
          className="integrations-network-hub"
          style={{
            left: `${INTEGRATION_HUB_POSITION.x}%`,
            top: `${INTEGRATION_HUB_POSITION.y}%`,
          }}
        >
          <span aria-hidden="true" />
          <img src="/imgs/logo-square.png" alt="Vortex" />
        </div>
      </div>
    </section>
  );
}

export default IntegrationsNetworkComponent;
