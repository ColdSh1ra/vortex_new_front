import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TrialRequestComponent from '../components/TrialRequestComponent';
import { useI18n } from '../context/ContentContext';
import {
  getWebsiteImage, getWebsiteServiceKey, isWebsiteServiceIncluded,
  WEBSITE_PLANS, WEBSITE_SERVICES,
} from '../data/websitePlans';
import type { WebsitePackage } from '../data/websitePlans';

function WebsitePreview({ name, label, className = '' }: { name: string; label: string; className?: string }) {
  const image = getWebsiteImage(name);
  return (
    <div className={`websites-preview ${className}`} role={image ? undefined : 'img'} aria-label={image ? undefined : label}>
      {image && <img src={image} alt={label} loading="lazy" />}
    </div>
  );
}

function WebsiteDevelopmentPage() {
  const { content, t } = useI18n();
  const overview = content?.homepage.website_development_section;
  const [selectedPackage, setSelectedPackage] = useState<WebsitePackage | undefined>();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryPosition, setGalleryPosition] = useState({ atStart: true, atEnd: false });
  const selectedPlan = WEBSITE_PLANS.find((plan) => plan.id === selectedPackage);

  const updateGalleryPosition = () => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    setGalleryPosition({
      atStart: gallery.scrollLeft <= 2,
      atEnd: gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2,
    });
  };

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const observer = new ResizeObserver(updateGalleryPosition);
    observer.observe(gallery);
    updateGalleryPosition();
    return () => observer.disconnect();
  }, []);

  const scrollGallery = (direction: number) => {
    const gallery = galleryRef.current;
    const firstCard = gallery?.firstElementChild;
    if (gallery && firstCard) {
      gallery.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + 8), behavior: 'smooth' });
    }
  };

  const choosePackage = (plan: WebsitePackage) => {
    setSelectedPackage(plan);
    document.getElementById('trial-request')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="websites-page">
      <div className="websites-light-content">
        <nav className="websites-breadcrumbs" aria-label={t('common.breadcrumbs')}>
          <ol>
            <li><Link to="/">{t('common.home')}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('nav.websites')}</li>
          </ol>
        </nav>

        {overview && <section className="websites-overview" aria-labelledby="websites-heading">
          <header className="websites-intro websites-panel">
            <h1 id="websites-heading">{overview.heading}</h1>
            <p>{overview.gift_message}</p>
          </header>

          <div className="websites-overview-grid">
            <div className="websites-overview-preview websites-panel">
              <WebsitePreview name="overview" label={t('website.alt')} />
            </div>
            <div className="websites-overview-details">
              <div className="websites-description websites-panel">
                {overview.description_paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="websites-benefits">
                {overview.benefit_groups.map((group) => (
                  <div className="websites-benefit websites-panel" key={group.image_src}>
                    <ul>
                      {group.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    {group.note && <small>{group.note}</small>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="websites-upgrade websites-panel"><p>{overview.upgrade_message}</p></div>
        </section>}
      </div>

      <div className="websites-transition" aria-hidden="true" />

      <div className="websites-dark-content">
        <section className="websites-examples" aria-labelledby="websites-examples-heading">
          <header className="websites-examples-header">
            <h2 id="websites-examples-heading" className="websites-section-title">{t('websites.examplesTitle')}</h2>
            <div className="websites-gallery-controls">
              <button type="button" onClick={() => scrollGallery(-1)} disabled={galleryPosition.atStart} aria-label={t('common.previous')} aria-controls="websites-gallery">
                <img src="/icons/slider_scroll_right.svg" alt="" />
              </button>
              <button type="button" onClick={() => scrollGallery(1)} disabled={galleryPosition.atEnd} aria-label={t('common.next')} aria-controls="websites-gallery">
                <img src="/icons/slider_scroll_right.svg" alt="" />
              </button>
            </div>
          </header>
          <div className="websites-gallery" id="websites-gallery" ref={galleryRef} onScroll={updateGalleryPosition}>
            {WEBSITE_PLANS.map((plan) => (
              <article className="websites-example" key={plan.id}>
                <WebsitePreview name={`example-${plan.id}`} label={t('websites.preview', { name: t(`websites.plan.${plan.id}`) })} />
                <span className={`websites-template-badge${plan.id === 'free' ? ' is-free' : ''}`}>
                  {t(plan.id === 'free' ? 'websites.freeTemplate' : 'websites.paidTemplate')}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="websites-pricing" id="pricing" aria-labelledby="websites-pricing-heading">
          <header className="websites-pricing-intro">
            <h2 id="websites-pricing-heading" className="websites-section-title">{t('websites.plansTitle')}</h2>
            <p>{t('websites.plansDescription')}</p>
          </header>
          <div className="website-plans-grid">
            {WEBSITE_PLANS.map((plan) => (
              <article className={`website-plan website-plan-${plan.id}${selectedPackage === plan.id ? ' is-selected' : ''}`} key={plan.id} aria-labelledby={`website-plan-${plan.id}`}>
                <header className="website-plan-heading">
                  <h3 id={`website-plan-${plan.id}`}>{t(`websites.plan.${plan.id}`)}</h3>
                  <p className="website-plan-price"><strong>${plan.price}</strong>{plan.price > 0 && <span>({t('websites.oneTime')})</span>}</p>
                  <p className="website-plan-billing">{t(plan.price === 0 ? 'websites.noExtra' : 'websites.monthly')}</p>
                </header>
                <ul className="website-plan-features" role="list">
                  {WEBSITE_SERVICES.map((service) => {
                    const included = isWebsiteServiceIncluded(plan.id, service);
                    return (
                      <li className={included ? 'is-included' : ''} key={service}>
                        <span className="website-service-indicator" aria-hidden="true" />
                        <span>{t(`websites.services.${getWebsiteServiceKey(plan.id, service)}`)}<span className="websites-sr-only"> — {t(included ? 'websites.included' : 'websites.notIncluded')}</span></span>
                      </li>
                    );
                  })}
                </ul>
                <button className="website-plan-choose" type="button" onClick={() => choosePackage(plan.id)} aria-describedby={`website-plan-${plan.id}`}>
                  {t('websites.choose')}
                  <span aria-hidden="true"><img src="/icons/chevron-right-double.svg" alt="" /></span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <TrialRequestComponent totalSum={selectedPlan?.price ?? 0} showCalculatedPrice={false} websitePackage={selectedPackage} />
      </div>
    </div>
  );
}

export default WebsiteDevelopmentPage;
