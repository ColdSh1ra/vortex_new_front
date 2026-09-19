function VortexSyncComponent() {
  return (
    <section className="section-container vortex-sync-section">
      <div className="vortex-sync-grid">
        <article className="vortex-sync-copy">
          <h2>Vortex Sync</h2>

          <div className="vortex-sync-description">
            <p>
              Розроблена нами технологія Sync (читається як «сінк», або «синк»)
              дозволяє вам швидко налаштувати онлайн обмін наявностями та замовленнями
              з іншим магазином, що користується Vortex.
            </p>
            <p>
              Ви самі вирішуєте, чи бачитимуть вас інші клієнти в списку потенційних
              підключень, які наявності їм передавати та яку націнку застосовувати до них.
            </p>
            <p>
              Всі наявності, завантажені в вашу програму по системі Sync, будуть відмічені
              спеціальним тегом і при їх замовленні інша сторона відразу формує замовлення
              і надсилає менеджерам сповіщення «Нове замовлення Sync». Таке ж сповіщення
              отримаєте і ви, якщо інша сторона замовить у вас.
            </p>
            <p>
              Оновлювати склади з наявностями при цьому не потрібно, Sync подбає про це
              замість вас.
            </p>
          </div>
        </article>

        <div
          className="vortex-sync-visual"
          role="img"
          aria-label="Швидкий обмін товарами між двома клієнтами Vortex Sync"
        >
          <div className="vortex-sync-client vortex-sync-client-left">
            <img
              src="/imgs/3dicons_premium/3dicons-boy-right-premium.png"
              alt=""
              width="148"
              height="148"
            />
            <span>Клієнт Vortex 1</span>
          </div>

          <div className="vortex-sync-exchange" aria-hidden="true">
            <strong>Vortex Sync</strong>

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
            <span>Клієнт Vortex 2</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VortexSyncComponent;
