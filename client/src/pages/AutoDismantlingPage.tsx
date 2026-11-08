import { Link } from 'react-router-dom';
import TrialRequestComponent from '../components/TrialRequestComponent';
import { useI18n } from '../context/ContentContext';

const vehicleFields = ['vin', 'year', 'engine', 'body', 'fuel', 'cost'];
const sections = ['vehicle', 'statuses', 'parts'];
const methods = ['manual', 'diagram', 'groups'];

function AutoDismantlingPage() {
  const { t } = useI18n();

  return (
    <div className="dismantling-page">
      <div className="dismantling-light-content">
        <nav className="dismantling-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to="/">{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('nav.dismantling')}</li>
          </ol>
        </nav>

        <section className="dismantling-hero" aria-labelledby="dismantling-heading">
          <div className="dismantling-hero-copy">
            <p className="dismantling-eyebrow">{t('dismantling.eyebrow')}</p>
            <h1 id="dismantling-heading">{t('dismantling.title')}<span>{t('dismantling.tagline')}</span></h1>
            <p className="dismantling-lead">{t('dismantling.intro')}</p>
            <a className="dismantling-cta" href="#trial-request">
              {t('common.tryFree')}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="dismantling-hero-art">
            <img src="/imgs/auto-dismantling/dismantling-car.png" alt="" width="1536" height="1024" fetchPriority="high" />
          </div>
        </section>

        <nav className="dismantling-section-links" aria-label={t('dismantling.contents')}>
          {sections.map((section, index) => (
            <a key={section} href={`#dismantling-${section}`}>
              <span className="dismantling-section-number" aria-hidden="true">0{index + 1}/</span>
              {t(`dismantling.${section}.label`)}
              <span aria-hidden="true">↓</span>
            </a>
          ))}
        </nav>

        <section className="dismantling-vehicle" id="dismantling-vehicle" aria-labelledby="dismantling-vehicle-heading">
          <div className="dismantling-record-art">
            <img src="/imgs/auto-dismantling/vehicle-record.png" alt="" width="1312" height="1199" loading="lazy" />
          </div>
          <div className="dismantling-vehicle-copy">
            <p className="dismantling-eyebrow">01 / {t('dismantling.vehicle.label')}</p>
            <h2 id="dismantling-vehicle-heading">{t('dismantling.vehicle.title')}</h2>
            <p>{t('dismantling.vehicle.description')}</p>
            <ul className="dismantling-fields">
              {vehicleFields.map((field) => <li key={field}>{t(`dismantling.field.${field}`)}</li>)}
            </ul>
          </div>
          <div className="dismantling-vehicle-benefits">
            {['earnings', 'inventory'].map((benefit) => (
              <article key={benefit}>
                <h3>{t(`dismantling.${benefit}.title`)}</h3>
                <p>{t(`dismantling.${benefit}.description`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dismantling-statuses" id="dismantling-statuses" aria-labelledby="dismantling-statuses-heading">
          <header className="dismantling-section-intro">
            <p className="dismantling-eyebrow">02 / {t('dismantling.statuses.label')}</p>
            <h2 id="dismantling-statuses-heading">{t('dismantling.statuses.title')}</h2>
            <p>{t('dismantling.statuses.description')}</p>
          </header>
          <div className="dismantling-status-grid">
            {['active', 'archived'].map((status) => (
              <article className={`dismantling-status dismantling-status-${status}`} key={status}>
                <span className="dismantling-status-label"><span aria-hidden="true" />{t(`dismantling.${status}.label`)}</span>
                <h3>{t(`dismantling.${status}.title`)}</h3>
                <p>{t(`dismantling.${status}.description`)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="dismantling-transition" aria-hidden="true" />

      <section className="dismantling-parts" id="dismantling-parts" aria-labelledby="dismantling-parts-heading">
        <div className="dismantling-parts-intro">
          <header>
            <p className="dismantling-eyebrow">03 / {t('dismantling.parts.label')}</p>
            <h2 id="dismantling-parts-heading">{t('dismantling.parts.title')}</h2>
            <p>{t('dismantling.parts.description')}</p>
          </header>
          <img src="/imgs/auto-dismantling/parts-catalog.png" alt="" width="1536" height="1024" loading="lazy" />
        </div>

        <div className="dismantling-methods">
          {methods.map((method, index) => (
            <article className="dismantling-method" key={method}>
              <span className="dismantling-method-number" aria-hidden="true">0{index + 1}/</span>
              <h3>{t(`dismantling.method.${method}.title`)}</h3>
              <p>{t(`dismantling.method.${method}.description`)}</p>
            </article>
          ))}
        </div>

        <div className="dismantling-workflow">
          <h3>{t('dismantling.workflow.title')}</h3>
          <ol>
            {['vehicle', 'catalog', 'part'].map((step) => (
              <li key={step}>{t(`dismantling.workflow.${step}`)}</li>
            ))}
          </ol>
          <p>{t('dismantling.workflow.example')}</p>
        </div>
      </section>

      <TrialRequestComponent totalSum={0} showCalculatedPrice={false} />
    </div>
  );
}

export default AutoDismantlingPage;
