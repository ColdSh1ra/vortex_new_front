import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ContactWorkerCard from '../components/ContactWorkerCard';
import TrialRequestComponent from '../components/TrialRequestComponent';
import { useInitialContent } from '../context/ContentContext';
import { getContent } from '../services/api';
import type { VortexContent } from '../types/content';

function ContactPage() {
  const initialContent = useInitialContent();
  const [content, setContent] = useState<VortexContent | null>(initialContent);

  useEffect(() => {
    if (content) {
      return;
    }

    let isMounted = true;

    getContent()
      .then((loadedContent) => {
        if (isMounted) {
          setContent(loadedContent);
        }
      })
      .catch(() => {
        // Content will appear after the API is available.
      });

    return () => {
      isMounted = false;
    };
  }, [content]);

  const contacts = content?.contacts;

  return (
    <div className="contacts-page">
      <div className="contacts-page-content">
        <nav className="contacts-breadcrumbs" aria-label="Хлібні крихти">
          <ol>
            <li><Link to="/">Головна сторінка</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Контакти</li>
          </ol>
        </nav>

        <section className="contacts-section" aria-labelledby="contacts-heading">
          <header className="contacts-intro">
            <h1 id="contacts-heading">{contacts?.title ?? 'Контакти'}</h1>
            <p>{contacts?.subtitle ?? 'Залишились запитання? Ми завжди раді допомогти Вам.'}</p>
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
