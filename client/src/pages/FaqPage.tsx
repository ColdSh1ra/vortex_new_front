import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FaqDataContainer from '../components/FaqDataContainer';
import { useInitialContent } from '../context/ContentContext';
import { getContent } from '../services/api';
import type { VortexContent } from '../types/content';
import { sanitizeJsonLd } from '../utils/sanitizeHtml';

const SITE_URL = 'https://crm-vortex.com';

function htmlToPlainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/li>/gi, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function FaqPage() {
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

  const faqItems = content?.FAQ ?? [];
  const videoItems = content?.videos ?? [];
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${SITE_URL}/faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.topic,
      acceptedAnswer: {
        '@type': 'Answer',
        text: htmlToPlainText(item.answer),
      },
    })),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Головна сторінка',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Запитання',
        item: `${SITE_URL}/faq`,
      },
    ],
  };

  return (
    <div className="faq-page">
      <div className="faq-page-content">
        <nav className="faq-breadcrumbs" aria-label="Хлібні крихти">
          <ol>
            <li><Link to="/">Головна сторінка</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Запитання</li>
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
          <h2 id="functionality-heading" className="faq-section-title">Функціонал</h2>
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(breadcrumbSchema) }}
      />
    </div>
  );
}

export default FaqPage;
