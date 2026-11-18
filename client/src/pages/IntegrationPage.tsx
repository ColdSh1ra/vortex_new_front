import ChevronCircle from '../components/default/ChevronCircle';
import { imageSize } from '../utils/imageSize';
import { useParams } from 'react-router-dom';
import Link from '../components/default/LocalizedLink';
import { useI18n } from '../context/ContentContext';
import { API_INTEGRATIONS, getIntegrationCopy } from '../data/apiIntegrations';
import { blogText } from '../blog/copy';

function ChevronRight() {
  return <img className="chevron-right-icon" src="/icons/double-chevron-right.svg" alt="" width="20" height="20" />;
}

export default function IntegrationPage() {
  const { slug } = useParams<{ slug: string }>();
  const { content, language, t } = useI18n();
  const copy = getIntegrationCopy(language);
  const integration = API_INTEGRATIONS.find((item) => item.slug === slug);
  const page = integration ? copy.pages[integration.slug] : undefined;
  const cards = content?.homepage.integrations_catalog_section.cards ?? [];
  const card = integration ? cards.find((item) => item.link_href === `/integrations/${integration.slug}`) : undefined;

  if (!integration || !page) {
    return (
      <div className="integration-page integration-missing">
        <h1>{blogText(language, 'missing')}</h1>
        <Link className="integration-primary-link" to="/#integrations-catalog">{copy.back}<ChevronCircle /></Link>
      </div>
    );
  }

  const sectionImageIndexes = page.sections.map((_, index) => integration.sectionImageIndexes ? integration.sectionImageIndexes[index] : index);
  const galleryImages = integration.images.filter((_, index) => !sectionImageIndexes.includes(index));

  return (
    <div className="integration-page">
      <div className="integration-light-content">
        <nav className="integration-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to="/">{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/#integrations-catalog">{copy.label}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{card?.title ?? page.title}</li>
          </ol>
        </nav>

        <section className="integration-hero" aria-labelledby="integration-heading">
          <div className="integration-hero-copy">
            <p className="integration-eyebrow">{copy.eyebrow}</p>
            <h1 id="integration-heading">{page.title}</h1>
            <p className="integration-lead">{page.lead}</p>
            <div className="integration-hero-actions">
              <Link className="integration-primary-link" to="/contact">{copy.connect}<ChevronCircle /></Link>
              <a className="integration-secondary-link" href="#integration-features">{copy.viewFeatures}<span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="integration-hero-logo">
            <img src={integration.imageSrc} alt={card?.title ?? page.title} width="320" height="160" fetchPriority="high" />
          </div>
        </section>

        <section className="integration-features" id="integration-features" aria-labelledby="integration-features-heading">
          <header className="integration-section-header">
            <p className="integration-eyebrow">Vortex + {card?.title ?? page.title}</p>
            <h2 id="integration-features-heading">{copy.featuresTitle}</h2>
          </header>
          {card && <ul className="integration-feature-grid">
            {card.features.map((feature, index) => (
              <li key={`${feature}-${index}`}>
                <span className="integration-feature-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}/</span>
                <p>{feature}</p>
              </li>
            ))}
          </ul>}
        </section>

        <div className="integration-detail-sections">
          {page.sections.map((section, index) => {
            const imageIndex = sectionImageIndexes[index];
            const image = imageIndex == null ? undefined : integration.images[imageIndex];
            return (
              <section className={`integration-detail-section${image ? ' has-illustration' : ''}`} aria-labelledby={`integration-detail-${index}`} key={`${section.title}-${index}`}>
                <h2 id={`integration-detail-${index}`}>{section.title}</h2>
                <div className="integration-detail-copy">
                  {section.paragraphs.map((paragraph, paragraphIndex) => <p key={`${paragraph}-${paragraphIndex}`}>{paragraph}</p>)}
                  {section.items.length > 0 && <ul>{section.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</ul>}
                </div>
                {image && <figure className="integration-detail-illustration"><a href={image} target="_blank" rel="noopener noreferrer" aria-label={section.title}><img src={image} {...imageSize(image)} alt={section.title} loading="lazy" decoding="async" /></a></figure>}
              </section>
            );
          })}
        </div>

        {galleryImages.length > 0 && <div className="integration-screenshot-gallery">
          {galleryImages.map((image, index) => (
            <figure className="integration-detail-illustration" key={image}>
              <a href={image} target="_blank" rel="noopener noreferrer" aria-label={page.title}>
                <img src={image} {...imageSize(image)} alt={`${page.title} — ${index + 1}`} loading="lazy" decoding="async" />
              </a>
            </figure>
          ))}
        </div>}

        {page.links.length > 0 && <section className="integration-partner-links" aria-labelledby="integration-partner-heading">
          <h2 id="integration-partner-heading">{copy.linksTitle}</h2>
          <div className="integration-partner-grid">
            {page.links.map((link) => (
              <a href={link.href} target="_blank" rel="sponsored noopener noreferrer" key={link.href}>
                <span>{link.label}</span>
                <ChevronRight />
              </a>
            ))}
          </div>
        </section>}
      </div>

      <div className="integration-bottom-transition" aria-hidden="true" />
      <section className="integration-related" aria-labelledby="integration-related-heading">
        <h2 id="integration-related-heading">{copy.relatedTitle}</h2>
        <div className="integration-related-grid">
          {API_INTEGRATIONS.filter((item) => item.slug !== integration.slug).map((item) => {
            const relatedCard = cards.find((entry) => entry.link_href === `/integrations/${item.slug}`);
            const title = relatedCard?.title ?? copy.pages[item.slug]?.title ?? item.slug;
            return (
              <Link className="integration-related-card" to={`/integrations/${item.slug}`} key={item.slug}>
                <div className="integration-related-logo"><img src={item.imageSrc} alt="" width="180" height="60" loading="lazy" /></div>
                <span className="integration-related-name">{title}<ChevronRight /></span>
              </Link>
            );
          })}
        </div>
        <div className="integration-bottom-actions">
          <Link className="integration-back-link" to="/#integrations-catalog">{copy.back}</Link>
          <Link className="integration-primary-link" to="/contact">{copy.connect}<ChevronCircle /></Link>
        </div>
      </section>
    </div>
  );
}
