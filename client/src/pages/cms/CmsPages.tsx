import { useEffect, useState } from 'react';
import Link from '../../components/default/LocalizedLink';
import ChevronCircle from '../../components/default/ChevronCircle';
import TrialRequestComponent from '../../components/TrialRequestComponent';
import { useI18n } from '../../context/ContentContext';
import type { CmsAutoshrot, CmsTecdoc, CmsWebsites } from '../../types/cmsContent';
import { blogText } from '../../blog/copy';
import { formatCmsPrice } from '../../utils/cmsContent';
import SliderControls from '../../components/default/SliderControls';
import { useScrollGallery } from '../../utils/useScrollGallery';
function Image({ src, alt = '', className }: {
    src: string;
    alt?: string;
    className?: string;
}) { return src ? <img className={className} src={src} alt={alt} loading="lazy" decoding="async"/> : null; }
function Breadcrumb({ title, className }: {
    title: string;
    className: string;
}) { const { t } = useI18n(); return <nav className={className} aria-label={t('common.breadcrumbs')}><ol><li><Link to="/">{t('common.home')}</Link></li><li aria-hidden="true">/</li><li aria-current="page">{title}</li></ol></nav>; }
export function CmsAutoDismantlingPage({ data }: {
    data: CmsAutoshrot;
}) {
    const { hero, navigation, car, statuses, removal, workflow } = data;
    const anchor = (part: string) => Object.entries(data.anchor_aliases).find(([, target]) => target === part)?.[0] ?? part;
    return <div className="dismantling-page"><div className="dismantling-light-content">
    <Breadcrumb className="dismantling-breadcrumbs" title={hero.title}/>
    {hero.visible && <section className="dismantling-hero"><div className="dismantling-hero-copy"><p className="dismantling-eyebrow">{hero.eyebrow}</p><h1>{hero.title}<span>{hero.slogan}</span></h1><p className="dismantling-lead">{hero.intro}</p>{hero.cta_target && <Link className="dismantling-cta" to={hero.cta_target}>{hero.cta_text}<ChevronCircle /></Link>}</div><div className="dismantling-hero-art"><Image src={hero.image} alt={hero.image_alt}/></div></section>}
    {navigation.visible && <nav className="dismantling-section-links" aria-label={navigation.label}>{navigation.items.map((item, index) => <Link key={`${item.target}-${index}`} to={["car", "statuses", "removal"].includes(item.target) ? "#" + anchor(item.target) : item.target}><span className="dismantling-section-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}/</span>{item.label}<span aria-hidden="true">↓</span></Link>)}</nav>}
    {car.visible && <section className="dismantling-vehicle" id={anchor('car')}><div className="dismantling-record-art"><Image src={car.image} alt={car.image_alt}/></div><div className="dismantling-vehicle-copy"><p className="dismantling-eyebrow">{car.eyebrow}</p><h2>{car.title}</h2><p>{car.description}</p><ul className="dismantling-fields">{car.characteristics.map((item, index) => <li key={index}>{item}</li>)}</ul></div><div className="dismantling-vehicle-benefits">{car.benefits.map((item, index) => <article key={index}><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>}
    {statuses.visible && <section className="dismantling-statuses" id={anchor('statuses')}><header className="dismantling-section-intro"><p className="dismantling-eyebrow">{statuses.eyebrow}</p><h2>{statuses.title}</h2><p>{statuses.description}</p></header><div className="dismantling-status-grid">{statuses.items.map((item, index) => <article className={`dismantling-status dismantling-status-${index === 0 ? 'active' : 'archived'}`} key={index}><span className="dismantling-status-label"><span aria-hidden="true"/>{item.name}</span><h3>{item.card_title}</h3><p>{item.card_description}</p></article>)}</div></section>}
  </div><div className="dismantling-transition" aria-hidden="true"/>
  {(removal.visible || workflow.visible) && <section className="dismantling-parts" id={anchor('removal')}>{removal.visible && <><div className="dismantling-parts-intro"><header><p className="dismantling-eyebrow">{removal.eyebrow}</p><h2>{removal.title}</h2><p>{removal.description}</p></header><Image src={removal.image} alt={removal.image_alt}/></div><div className="dismantling-methods">{removal.methods.map((item, index) => <article className="dismantling-method" key={index}><span className="dismantling-method-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}/</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></>}{workflow.visible && <div className="dismantling-workflow"><h3>{workflow.title}</h3><ol>{workflow.steps.map((item, index) => <li key={index}>{item}</li>)}</ol><p>{workflow.note}</p></div>}</section>}
  <TrialRequestComponent totalSum={0} showCalculatedPrice={false}/></div>;
}
export function CmsTecDocPage({ data }: {
    data: CmsTecdoc;
}) {
    if (!data.visible)
        return <MissingPage />;
    const { hero } = data;
    return <div className="tecdoc-page"><div className="tecdoc-light-content"><Breadcrumb className="tecdoc-breadcrumbs" title={hero.title}/><section className="tecdoc-hero"><p className="tecdoc-eyebrow">{hero.eyebrow}</p><h1>{hero.title}</h1><p className="tecdoc-hero-description">{hero.subtitle}</p><div className="tecdoc-hero-actions">{hero.cta_target && <Link className="tecdoc-primary-link" to={hero.cta_target}>{hero.cta_text}<ChevronCircle /></Link>}{hero.secondary_cta_target && <Link className="tecdoc-secondary-link" to={hero.secondary_cta_target}>{hero.secondary_cta_text}<span aria-hidden="true">↓</span></Link>}</div><div className="tecdoc-hero-details">{hero.details.map((item, index) => <span key={index}>{item}</span>)}</div><Image src={hero.image} alt={hero.image_alt}/></section>
  {data.sections.map(section => <section className="tecdoc-features" id={section.id} key={section.id}><div className="tecdoc-feature-intro">{section.image && <div className="tecdoc-feature-image"><Image src={section.image} alt={section.image_alt}/></div>}<header>{section.eyebrow && <p className="tecdoc-eyebrow">{section.eyebrow}</p>}<h2>{section.title}</h2><p>{section.description}</p></header></div>{section.blocks?.length ? <div className="tecdoc-about-grid">{section.blocks.map(block => <article key={block.id}><h3>{block.title}</h3>{block.paragraphs.map((p, index) => <p key={index}>{p}</p>)}</article>)}</div> : null}{section.items.length > 0 && <ul>{section.items.map((item, index) => <li key={index}>{item}</li>)}</ul>}{section.button_target && <Link className="tecdoc-secondary-link" to={section.button_target}>{section.button_text}</Link>}</section>)}
  {data.stats.length > 0 && <dl className="tecdoc-statistics">{data.stats.map((item, index) => <div key={index}><dt>{item.label}</dt><dd>{item.value}<small>{item.suffix}</small></dd></div>)}</dl>}</div><div className="tecdoc-bottom-transition" aria-hidden="true"/><TrialRequestComponent totalSum={0} requestedProduct="tecdoc" showCalculatedPrice={false}/></div>;
}
export function CmsWebsitePage({ data }: {
    data: CmsWebsites;
}) {
    const { content, t, language } = useI18n();
    const overview = content?.homepage.website_development_section;
    const [selected, setSelected] = useState<string>();
    const plan = data.pricing.tariffs.find(item => item.id === selected);
    const gallery = useScrollGallery();
    useEffect(() => { if (selected && !data.pricing.tariffs.some(item => item.id === selected))
        setSelected(undefined); }, [data.pricing.tariffs, selected]);
    return <div className="websites-page"><div className="websites-light-content"><Breadcrumb className="websites-breadcrumbs" title={t('nav.websites')}/>
  {overview && overview.visible !== false && <section className="websites-overview"><header className="websites-intro websites-panel"><h1>{overview.heading}</h1><p>{overview.gift_message}</p></header><div className="websites-overview-grid"><div className="websites-overview-preview websites-panel"><div className="websites-preview"><Image src={overview.website_image_src} alt={overview.website_image_alt ?? t('website.alt')}/></div></div><div className="websites-overview-details"><div className="websites-description websites-panel">{overview.description_paragraphs.map((p, index) => <p key={index}>{p}</p>)}</div><div className="websites-benefits">{overview.benefit_groups.map((group, index) => <div className="websites-benefit websites-panel" key={index}><ul>{group.items.map((item, i) => <li key={i}>{item}</li>)}</ul>{group.note && <small>{group.note}</small>}</div>)}</div></div></div><div className="websites-upgrade websites-panel"><p>{overview.upgrade_message}</p></div></section>}</div>
  <div className="websites-transition" aria-hidden="true"/><div className="websites-dark-content">
  {data.gallery.visible && <section className="websites-examples"><header className="websites-examples-header"><h2 className="websites-section-title">{data.gallery.section_title}</h2><SliderControls onPrevious={() => gallery.scroll(-1)} onNext={() => gallery.scroll(1)} previousDisabled={gallery.position.atStart} nextDisabled={gallery.position.atEnd} controls="websites-gallery"/></header><div className="websites-gallery" id="websites-gallery" ref={gallery.ref} onScroll={gallery.onScroll}>{data.gallery.items.filter(item => item.image).map(item => <article className="websites-example" key={item.id}>{item.url ? <Link to={item.url}><div className="websites-preview"><Image src={item.image} alt={item.alt}/></div></Link> : <div className="websites-preview"><Image src={item.image} alt={item.alt}/></div>}<span className="websites-template-badge">{item.template}</span>{item.title && <h3>{item.title}</h3>}</article>)}</div></section>}
  {data.pricing.visible && <section className="websites-pricing" id="pricing"><header className="websites-pricing-intro"><h2 className="websites-section-title">{data.pricing.section_title}</h2><p>{data.pricing.section_description}</p></header><div className="website-plans-grid">{data.pricing.tariffs.map(tariff => <article className={`website-plan website-plan-${tariff.id}${selected === tariff.id ? ' is-selected' : ''}`} key={tariff.id}><header className="website-plan-heading"><h3>{tariff.name}</h3><p className="website-plan-price"><strong>{formatCmsPrice(tariff.price, tariff.currency, language)}</strong><span>{t(tariff.billing_type === 'free' ? 'websites.noExtra' : tariff.billing_type === 'monthly' ? 'pricing.monthly' : 'pricing.oneTime')}</span></p><p className="website-plan-billing">{tariff.extra_payments_note}</p></header><ul className="website-plan-features" role="list">{data.pricing.services.map(service => { const cell = service.plans[tariff.id]; return <li className={cell?.included ? 'is-included' : ''} key={service.id}><span className="website-service-indicator" aria-hidden="true"/><span>{cell?.text ?? service.text}{cell?.note && <small> — {cell.note}</small>}<span className="websites-sr-only"> — {t(cell?.included ? 'websites.included' : 'websites.notIncluded')}</span></span></li>; })}</ul><button className="website-plan-choose" type="button" onClick={() => { setSelected(tariff.id); document.getElementById('trial-request')?.scrollIntoView({ behavior: 'smooth' }); }}>{tariff.cta_text}<ChevronCircle /></button></article>)}</div></section>}
  <TrialRequestComponent totalSum={plan?.price ?? 0} showCalculatedPrice={false} websitePackage={selected}/></div></div>;
}
export function MissingPage() { const { t, language, content } = useI18n(); return <div className="blog-page blog-status"><h1>{blogText(language, 'missing', {}, content)}</h1><Link to="/">{t('common.home')}</Link></div>; }
