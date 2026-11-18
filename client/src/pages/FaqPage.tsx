import Link from '../components/default/LocalizedLink';
import FaqDataContainer from '../components/FaqDataContainer';
import { useI18n } from '../context/ContentContext';

function FaqPage() {
  const { content, t } = useI18n();

  const faqItems = content?.FAQ ?? [];
  const videoItems = content?.videos ?? [];

  return (
    <div className="faq-page">
      <div className="faq-page-content">
        <nav className="faq-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to="/">{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('nav.faq')}</li>
          </ol>
        </nav>

        <section className="faq-section" aria-labelledby="faq-heading">
          <h1 id="faq-heading" className="faq-section-title">FAQ</h1>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <FaqDataContainer
                key={item.topic}
                question={item.topic}
                answer={item.answer}
                defaultOpen={index === 0 || index === faqItems.length - 1}
              />
            ))}
          </div>
        </section>

        <section className="faq-section faq-functionality" aria-labelledby="functionality-heading">
          <h2 id="functionality-heading" className="faq-section-title">{t('faq.functionality')}</h2>
          <div className="faq-list">
            {videoItems.map((item, index) => (
              <FaqDataContainer
                key={item.topic}
                question={item.topic}
                answer={item.answer}
                defaultOpen={index === 0 || index === videoItems.length - 1}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="faq-bottom-transition" aria-hidden="true" />

    </div>
  );
}

export default FaqPage;
