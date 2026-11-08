import { Link } from 'react-router-dom';
import TrialRequestComponent from '../components/TrialRequestComponent';
import { useI18n } from '../context/ContentContext';

const catalogStatistics = [
  { value: '25+', key: 'experience' },
  { value: '140+', key: 'countries' },
  { value: '41+', key: 'languages' },
  { value: '900+', key: 'brands' },
  { value: '400', key: 'references', suffix: 'million' },
  { value: '8.8', key: 'articles', suffix: 'million' },
  { value: '9600+', key: 'groups' },
  { value: '160+', key: 'vehicles', suffix: 'thousand' },
];

function TecDocLicensePage() {
  const { t } = useI18n();

  return (
    <div className="tecdoc-page">
      <div className="tecdoc-light-content">
        <nav className="tecdoc-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to="/">{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('nav.tecdoc')}</li>
          </ol>
        </nav>

        <section className="tecdoc-hero" aria-labelledby="tecdoc-heading">
          <p className="tecdoc-eyebrow">TecDoc Web Catalog 3.0</p>
          <h1 id="tecdoc-heading"><span>Vortex —</span>{t('tecdoc.heroTitle')}</h1>
          <p className="tecdoc-hero-description">{t('tecdoc.heroDescription')}</p>
          <div className="tecdoc-hero-actions">
            <a className="tecdoc-primary-link" href="#trial-request">{t('tecdoc.buyLicense')}<span aria-hidden="true">↗</span></a>
            <a className="tecdoc-secondary-link" href="#tecdoc-features">{t('tecdoc.featuresLink')}<span aria-hidden="true">↓</span></a>
          </div>
          <div className="tecdoc-hero-details">
            <span>{t('tecdoc.officialReseller')}</span>
            <span>{t('tecdoc.trialBadge')}</span>
            <span>TecDoc + TecRMI</span>
          </div>
        </section>

        <section className="tecdoc-about" aria-labelledby="tecdoc-about-heading">
          <h2 id="tecdoc-about-heading">{t('tecdoc.aboutTitle')}</h2>
          <div className="tecdoc-about-grid">
            <article className="tecdoc-about-catalog">
              <h3>TecDoc Web</h3>
              <p>{t('tecdoc.aboutCatalog')}</p>
              <p>{t('tecdoc.aboutSearch')}</p>
            </article>
            <article className="tecdoc-about-vortex">
              <h3>{t('tecdoc.whyVortex')}</h3>
              <p>{t('tecdoc.resellerDescription')}</p>
              <p>{t('tecdoc.expertiseDescription')}</p>
              <p>{t('tecdoc.dataDescription')}</p>
            </article>
          </div>
        </section>

        <section className="tecdoc-features" id="tecdoc-features" aria-labelledby="tecdoc-features-heading">
          <div className="tecdoc-feature-intro">
            <div className="tecdoc-feature-image">
              <img src="/imgs/tecdoc/tecdoc-parts.png" alt={t('tecdoc.catalogImageAlt')} width="701" height="414" loading="lazy" />
            </div>
            <header>
              <p className="tecdoc-eyebrow">TecDoc</p>
              <h2 id="tecdoc-features-heading">{t('tecdoc.catalogTitle')}</h2>
              <p>{t('tecdoc.catalogDescription')}</p>
            </header>
          </div>
          <dl className="tecdoc-statistics">
            {catalogStatistics.map((statistic) => (
              <div key={statistic.key}>
                <dt>{t(`tecdoc.stat.${statistic.key}`)}</dt>
                <dd>{statistic.value}{statistic.suffix && <small>{t(`tecdoc.${statistic.suffix}`)}</small>}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="tecdoc-rmi" aria-labelledby="tecdoc-rmi-heading">
          <div className="tecdoc-rmi-copy">
            <p className="tecdoc-eyebrow">TecRMI</p>
            <h2 id="tecdoc-rmi-heading">{t('tecdoc.rmiTitle')}</h2>
            <p>{t('tecdoc.rmiDescription')}</p>
            <ul>
              {['maintenance', 'parts', 'labour', 'instructions'].map((feature) => <li key={feature}>{t(`tecdoc.rmi.${feature}`)}</li>)}
            </ul>
          </div>
          <div className="tecdoc-feature-image">
            <img src="/imgs/tecdoc/tecdoc-screenshot.png" alt={t('tecdoc.rmiImageAlt')} width="760" height="444" loading="lazy" />
          </div>
        </section>
      </div>

      <div className="tecdoc-bottom-transition" aria-hidden="true" />
      <TrialRequestComponent totalSum={0} requestedProduct="tecdoc" showCalculatedPrice={false} />
    </div>
  );
}

export default TecDocLicensePage;
