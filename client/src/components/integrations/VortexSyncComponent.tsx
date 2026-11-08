import { useI18n } from '../../context/ContentContext';
function VortexSyncComponent() {
  const { t } = useI18n();
  return (
    <section className="section-container vortex-sync-section">
      <div className="vortex-sync-grid">
        <article className="vortex-sync-copy">
          <h2>{t('sync.title')}</h2>

          <div className="vortex-sync-description">
            {['first', 'second', 'third', 'fourth'].map((key) => <p key={key}>{t(`sync.${key}`)}</p>)}
          </div>
        </article>

        <div
          className="vortex-sync-visual"
          role="img"
          aria-label={t('sync.alt')}
        >
          <div className="vortex-sync-client vortex-sync-client-left">
            <img
              src="/imgs/3dicons_premium/3dicons-boy-right-premium.png"
              alt=""
              width="148"
              height="148"
            />
            <span>{t('sync.client', { number: 1 })}</span>
          </div>

          <div className="vortex-sync-exchange" aria-hidden="true">
            <strong>{t('sync.title')}</strong>

            <div className="vortex-sync-items vortex-sync-items-to-right">
              {[0, 1, 2].map((item) => (
                <img
                  key={item}
                  src="/imgs/3dicons_premium/3d-shopping-bag-premium.svg"
                  alt=""
                  style={{ '--sync-item-index': item } as React.CSSProperties}
                />
              ))}
            </div>

            <div className="vortex-sync-items vortex-sync-items-to-left">
              {[0, 1, 2, 3].map((item) => (
                <img
                  key={item}
                  src="/imgs/3dicons_premium/3d-shopping-bag-premium.svg"
                  alt=""
                  style={{ '--sync-item-index': item } as React.CSSProperties}
                />
              ))}
            </div>
          </div>

          <div className="vortex-sync-client vortex-sync-client-right">
            <img
              src="/imgs/3dicons_premium/3dicons-boy-left-premium.png"
              alt=""
              width="148"
              height="148"
            />
            <span>{t('sync.client', { number: 2 })}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VortexSyncComponent;
