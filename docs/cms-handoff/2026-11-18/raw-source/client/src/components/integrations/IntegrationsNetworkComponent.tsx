import { useI18n } from '../../context/ContentContext';
import { useEffect, useState } from 'react';
import IntegrationBranch from './IntegrationBranch';
import { INTEGRATION_HUB_POSITION, integrations } from './integrationData';

function IntegrationsNetworkComponent() {
  const { t } = useI18n();
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
        <h2>{t('network.title')}</h2>
        <p>{t('network.description')}</p>
      </header>

      <div
        className="integrations-network-map"
        role="img"
        aria-label={t('network.alt')}
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
