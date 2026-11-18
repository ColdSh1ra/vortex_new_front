import StickyHeading from '../components/default/StickyHeading';
import { Link } from 'react-router-dom';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { MissingPage } from './cms/CmsPages';
import { LANGUAGE_TAGS, useI18n } from '../context/ContentContext';
import { localizedUrl } from '../seo/urls';
import type { Language } from '../types/content';
import ua from '../locales/privacy/ua.json';
import cz from '../locales/privacy/cz.json';
import sk from '../locales/privacy/sk.json';
import en from '../locales/privacy/en.json';
import pl from '../locales/privacy/pl.json';

const copies: Record<Language, typeof ua> = { ua, cz, sk, en, pl };
const updatedAt = '2026-11-16';
const policyHtml = sanitizeHtml;

export default function PrivacyPolicyPage() {
  const { t, language, content } = useI18n();
  const copy = content?.privacy_policy ?? copies[language];
  if (content?.privacy_policy?.visible === false) return <MissingPage/>;
  const edition = content?.privacy_policy?.updated_at ?? updatedAt;
  const date = new Intl.DateTimeFormat(LANGUAGE_TAGS[language], {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${edition}T00:00:00Z`));

  return (
    <div className="privacy-page">
      <div className="privacy-page-content">
        <nav className="privacy-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to={localizedUrl('/', language)}>{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{copy.title}</li>
          </ol>
        </nav>

        <article className="privacy-document" lang={LANGUAGE_TAGS[language]} aria-labelledby="privacy-heading">
          <header className="privacy-document-header">
            <p className="privacy-eyebrow">{copy.eyebrow}</p>
            <h1 id="privacy-heading">{copy.title}</h1>
            <p className="privacy-document-lead">{copy.lead}</p>
            <p className="privacy-document-date">{copy.updated} <time dateTime={edition}>{date}</time></p>
          </header>

          <nav className="privacy-contents" aria-labelledby="privacy-contents-heading">
            <h2 id="privacy-contents-heading">{copy.contents}</h2>
            <ol>
              {copy.sections.map(section => <li key={section.id}><a href={`#privacy-${section.id}`}>{section.title}</a></li>)}
            </ol>
          </nav>

          {copy.sections.map((section, index) => (
            <section className="privacy-section" id={`privacy-${section.id}`} aria-labelledby={`privacy-${section.id}-heading`} key={section.id}>
            <StickyHeading id={`privacy-${section.id}-heading`} data-header-title={section.title}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</StickyHeading>
              <div className="privacy-section-body" dangerouslySetInnerHTML={{ __html: policyHtml(section.html) }} />
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
