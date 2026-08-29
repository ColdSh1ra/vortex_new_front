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
          aria-label="Схема обміну замовленнями між двома клієнтами Vortex Sync"
        />
      </div>
    </section>
  );
}

export default VortexSyncComponent;
