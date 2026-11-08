import { useState } from 'react';
import { Link } from 'react-router-dom';
import PricingCalculatorComponent from '../components/PricingCalculatorComponent';
import TrialRequestComponent from '../components/TrialRequestComponent';
import { useI18n } from '../context/ContentContext';

function CarServicePage() {
  const { content, t } = useI18n();
  const [totalSum, setTotalSum] = useState(0);
  const page = content?.car_service;

  return (
    <div className="car-service-page">
      <div className="car-service-page-content">
        <nav className="car-service-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to="/">{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{page?.title}</li>
          </ol>
        </nav>

        {page && <>
          <header className="car-service-intro">
            <h1>{page.title}</h1>
            <p>{page.subtitle}</p>
          </header>

          <div className="car-service-blocks">
            {page.blocks.map((block, index) => (
              <section
                className={`car-service-block${index % 2 ? ' car-service-block-reverse' : ''}`}
                key={block.id}
                aria-labelledby={`car-service-${block.id}`}
              >
                <div className="car-service-copy">
                  <h2 id={`car-service-${block.id}`}>{block.title}</h2>
                  <div className="car-service-text">
                    {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {block.list_intro && <p>{block.list_intro}</p>}
                    {block.items && <ul className="car-service-list">
                      {block.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>}
                    {block.documents && <ul className="car-service-list car-service-documents">
                      {block.documents.map((document) => <li key={document.label}>
                        {document.href
                          ? <a href={document.href} target="_blank" rel="noopener noreferrer">{document.label}</a>
                          : <span>{document.label}</span>}
                      </li>)}
                    </ul>}
                    {block.closing_paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {block.note && <small>{block.note}</small>}
                  </div>
                </div>
                <img
                  className="car-service-image"
                  src={block.image_src}
                  alt={block.image_alt}
                  width="640"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </section>
            ))}
          </div>
        </>}
      </div>
      <div className="car-service-bottom-transition" aria-hidden="true" />
      <PricingCalculatorComponent onTotalChange={setTotalSum} />
      <TrialRequestComponent totalSum={totalSum} requestedProduct="vortex" />
    </div>
  );
}

export default CarServicePage;
