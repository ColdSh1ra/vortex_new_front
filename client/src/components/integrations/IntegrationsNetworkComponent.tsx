import StickyHeading from '../default/StickyHeading';
import { useI18n } from '../../context/ContentContext';
import { useEffect, useState } from 'react';
import IntegrationBranch from './IntegrationBranch';
import { INTEGRATION_HUB_POSITION, integrations } from './integrationData';

function IntegrationsNetworkComponent() {
  const { t, content } = useI18n();
  const section=content?.homepage.suppliers_section;
  const nodes=section ? section.suppliers.map((supplier,index)=>({name:supplier.logo_alt || supplier.name,imageSrc:supplier.logo,...(integrations[index] ? {x:integrations[index].x,y:integrations[index].y,size:integrations[index].size,animationDelay:integrations[index].animationDelay} : {x:50+42*Math.cos(index*2*Math.PI/section.suppliers.length),y:50+42*Math.sin(index*2*Math.PI/section.suppliers.length),size:'small' as const,animationDelay:index*180})})) : integrations;
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
        <StickyHeading>{section?.title ?? t('network.title')}</StickyHeading>
        <p>{section?.description ?? t('network.description')}</p>
      </header>

      <div
        className="integrations-network-map"
        role="img"
        aria-label={section?.image_alt ?? t('network.alt')}
      >
        {section?.image ? <img src={section.image} alt={section.image_alt} style={{width:"100%",height:"100%",objectFit:"contain"}}/> : <>
        <div className="integrations-network-glow" aria-hidden="true" />

        {nodes.map((integration) => (
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
        </div></>}
      </div>
    </section>
  );
}

export default IntegrationsNetworkComponent;
