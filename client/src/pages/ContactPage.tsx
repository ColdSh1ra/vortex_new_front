import { Link } from 'react-router-dom';
import ContactWorkerCard from '../components/ContactWorkerCard';
import TrialRequestComponent from '../components/TrialRequestComponent';
import { useI18n } from '../context/ContentContext';

function ContactPage() {
  const { content, t } = useI18n();

  const contacts = content?.contacts;

  return (
    <div className="contacts-page">
      <div className="contacts-page-content">
        <nav className="contacts-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to="/">{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('nav.contacts')}</li>
          </ol>
        </nav>

        <section className="contacts-section" aria-labelledby="contacts-heading">
          <header className="contacts-intro">
            <h1 id="contacts-heading">{contacts?.title}</h1>
            <p>{contacts?.subtitle}</p>
          </header>

          <div className="contacts-workers-grid">
            {contacts?.workers.map((worker) => (
              <ContactWorkerCard key={worker.full_name} worker={worker} />
            ))}
          </div>
        </section>
      </div>

      <div className="contacts-bottom-transition" aria-hidden="true" />
      <TrialRequestComponent
        totalSum={0}
        requestedProduct="vortex"
        showCalculatedPrice={false}
      />
    </div>
  );
}

export default ContactPage;
