'use strict';

// Export-only adapter. Its inputs come from the current application's content
// and websitePlans.ts; this module neither changes nor fetches website content.
const fs = require('node:fs');
const path = require('node:path');

const VEHICLE_FIELDS = ['vin', 'year', 'engine', 'body', 'fuel', 'cost'];
const REMOVAL_METHODS = ['manual', 'diagram', 'groups'];
const WEBSITE_IMAGE_NAMES = ['overview', 'example-free', 'example-practical', 'example-maximum'];
const WEBSITE_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif'];

function buildSections({ language, base, ui, websitePlans, websiteServices, isWebsiteServiceIncluded, getWebsiteServiceKey }) {
  if (!Array.isArray(websitePlans) || !Array.isArray(websiteServices)
    || typeof isWebsiteServiceIncluded !== 'function' || typeof getWebsiteServiceKey !== 'function') {
    throw new TypeError('buildSections requires actual website plans, services and their inclusion/label helpers.');
  }

  const notes = [];
  const missingKeys = new Set();
  const t = (key, values = {}) => {
    const value = ui?.[key] ?? base?.ui?.[key];
    if (typeof value !== 'string') {
      missingKeys.add(key);
      return '';
    }
    return value.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
  };

  // Match the existing import.meta.glob names and its lexicographical order.
  // A file named site_2.png is intentionally not treated as a gallery example.
  const websiteImageDirectory = path.join(process.cwd(), 'client/public/imgs/websites');
  const imageFiles = fs.existsSync(websiteImageDirectory) ? fs.readdirSync(websiteImageDirectory) : [];
  const matchingFiles = imageFiles.filter((filename) => {
    const extension = path.extname(filename).slice(1);
    return WEBSITE_IMAGE_EXTENSIONS.includes(extension)
      && WEBSITE_IMAGE_NAMES.includes(filename.slice(0, -(extension.length + 1)))
      && fs.statSync(path.join(websiteImageDirectory, filename)).isFile();
  }).sort();
  const websiteImage = (name) => {
    const filename = matchingFiles.find((candidate) => candidate.slice(0, -path.extname(candidate).length) === name);
    return filename ? `/imgs/websites/${filename}` : '';
  };

  const autoshrot = {
    hero: {
      visible: true,
      eyebrow: t('dismantling.eyebrow'),
      title: t('dismantling.title'),
      slogan: t('dismantling.tagline'),
      intro: t('dismantling.intro'),
      cta_text: t('common.tryFree'),
      cta_target: '#trial-request',
      image: '/imgs/auto-dismantling/dismantling-car-premium.png',
      image_alt: '',
    },
    navigation: {
      visible: true,
      // Extension: the current navigation's accessible name is editable copy.
      label: t('dismantling.contents'),
      items: [
        { label: t('dismantling.vehicle.label'), target: 'car' },
        { label: t('dismantling.statuses.label'), target: 'statuses' },
        { label: t('dismantling.parts.label'), target: 'removal' },
      ],
    },
    car: {
      visible: true,
      eyebrow: t('dismantling.vehicle.label'),
      title: t('dismantling.vehicle.title'),
      description: t('dismantling.vehicle.description'),
      image: '/imgs/auto-dismantling/vehicle-record-premium.png',
      image_alt: '',
      characteristics: VEHICLE_FIELDS.map((field) => t(`dismantling.field.${field}`)),
      benefits: ['earnings', 'inventory'].map((benefit) => ({
        title: t(`dismantling.${benefit}.title`),
        description: t(`dismantling.${benefit}.description`),
      })),
    },
    statuses: {
      visible: true,
      eyebrow: t('dismantling.statuses.label'),
      title: t('dismantling.statuses.title'),
      description: t('dismantling.statuses.description'),
      items: ['active', 'archived'].map((status) => ({
        name: t(`dismantling.${status}.label`),
        card_title: t(`dismantling.${status}.title`),
        card_description: t(`dismantling.${status}.description`),
      })),
    },
    removal: {
      visible: true,
      eyebrow: t('dismantling.parts.label'),
      title: t('dismantling.parts.title'),
      description: t('dismantling.parts.description'),
      image: '/imgs/auto-dismantling/parts-catalog-premium.png',
      image_alt: '',
      methods: REMOVAL_METHODS.map((method) => ({
        title: t(`dismantling.method.${method}.title`),
        description: t(`dismantling.method.${method}.description`),
      })),
    },
    workflow: {
      visible: true,
      title: t('dismantling.workflow.title'),
      steps: ['vehicle', 'catalog', 'part'].map((step) => t(`dismantling.workflow.${step}`)),
      note: t('dismantling.workflow.example'),
    },
    // Proposed migration metadata: these aliases do not alter the current DOM.
    anchor_aliases: {
      'dismantling-vehicle': 'car',
      'dismantling-statuses': 'statuses',
      'dismantling-parts': 'removal',
    },
  };
  notes.push('autoshrot: navigation targets normalized to CMS IDs car/statuses/removal. Current DOM IDs are dismantling-vehicle/dismantling-statuses/dismantling-parts; preserve them as aliases when migrating. The current hero and nested workflow do not have the proposed hero/workflow IDs yet.');
  notes.push('autoshrot extensions: navigation.label preserves the accessible navigation title; car/statuses/removal.eyebrow preserve the current section labels; anchor_aliases documents old-to-new fragment IDs. Section numbering remains presentation. Current images are decorative (image_alt="").');

  const statistics = [
    { value: 25, suffix: '+', key: 'experience' },
    { value: 140, suffix: '+', key: 'countries' },
    { value: 41, suffix: '+', key: 'languages' },
    { value: 900, suffix: '+', key: 'brands' },
    { value: 400, suffix: t('tecdoc.million'), key: 'references' },
    { value: 8.8, suffix: t('tecdoc.million'), key: 'articles' },
    { value: 9600, suffix: '+', key: 'groups' },
    { value: 160, suffix: `+ ${t('tecdoc.thousand')}`, key: 'vehicles' },
  ];
  const tecdoc = {
    visible: true,
    hero: {
      eyebrow: 'TecDoc Web Catalog 3.0',
      title: `Vortex — ${t('tecdoc.heroTitle')}`,
      subtitle: t('tecdoc.heroDescription'),
      image: '',
      image_alt: '',
      cta_text: t('tecdoc.buyLicense'),
      cta_target: '#trial-request',
      secondary_cta_text: t('tecdoc.featuresLink'),
      secondary_cta_target: '#tecdoc-features',
      details: [t('tecdoc.officialReseller'), t('tecdoc.trialBadge'), 'TecDoc + TecRMI'],
    },
    stats: statistics.map(({ value, suffix, key }) => ({ value, suffix, label: t(`tecdoc.stat.${key}`) })),
    sections: [
      {
        id: 'tecdoc-about',
        title: t('tecdoc.aboutTitle'),
        description: '',
        items: [],
        image: '',
        image_alt: '',
        button_text: '',
        button_target: '',
        blocks: [
          { id: 'catalog', title: 'TecDoc Web', paragraphs: [t('tecdoc.aboutCatalog'), t('tecdoc.aboutSearch')] },
          { id: 'vortex', title: t('tecdoc.whyVortex'), paragraphs: [t('tecdoc.resellerDescription'), t('tecdoc.expertiseDescription'), t('tecdoc.dataDescription')] },
        ],
      },
      {
        id: 'tecdoc-features',
        eyebrow: 'TecDoc',
        title: t('tecdoc.catalogTitle'),
        description: t('tecdoc.catalogDescription'),
        items: [],
        image: '/imgs/tecdoc/tecdoc-parts.png',
        image_alt: t('tecdoc.catalogImageAlt'),
        button_text: '',
        button_target: '',
      },
      {
        id: 'tecdoc-rmi',
        eyebrow: 'TecRMI',
        title: t('tecdoc.rmiTitle'),
        description: t('tecdoc.rmiDescription'),
        items: ['maintenance', 'parts', 'labour', 'instructions'].map((feature) => t(`tecdoc.rmi.${feature}`)),
        image: '/imgs/tecdoc/tecdoc-screenshot.png',
        image_alt: t('tecdoc.rmiImageAlt'),
        button_text: '',
        button_target: '',
      },
    ],
    license: {
      visible: true,
      eyebrow: 'TecDoc Web Catalog 3.0',
      price: 25,
      currency: 'EUR',
      billing_type: 'monthly',
      price_period: t('tecdoc.pricePeriod'),
      payment_terms: t('tecdoc.paymentTerms'),
      trial_terms: t('tecdoc.trialTerms'),
      trial_badge: t('tecdoc.trialBadge'),
    },
    cta: {
      title: t('tecdoc.buyLicense'),
      text: t('tecdoc.formDescription'),
      button_text: t('trial.send'),
      button_target: '#trial-request',
    },
  };
  notes.push('tecdoc extensions: hero.secondary_cta_text/secondary_cta_target and hero.details preserve the current second action and three badges; sections[].eyebrow and sections[].blocks[] {id,title,paragraphs} preserve original paragraphs and nested about articles. Only #tecdoc-features is currently a section anchor; tecdoc-about/tecdoc-rmi are proposed IDs.');
  notes.push('tecdoc.license is a required proposed CMS extension for the visible 25 EUR/month price, annual upfront-payment terms, trial badge and trial terms. These are license pricing, not CRM subscription packages. Hero has no image in the current page. Numeric statistics preserve their + and translated million/thousand suffixes.');
  notes.push('tecdoc.cta describes the current TecDoc request form. button_target is the local form anchor, not a purchase endpoint; submission retains requested_product=tecdoc. Shared form labels, validation and success copy remain in the exported UI dictionary.');

  const websites = {
    gallery: {
      visible: true,
      section_title: t('websites.examplesTitle'),
      items: websitePlans.map((plan) => {
        const name = t(`websites.plan.${plan.id}`);
        const imageName = `example-${plan.id}`;
        const image = websiteImage(imageName);
        if (!image) notes.push(`websites.gallery.items.${plan.id}: no existing ${imageName}.{png,jpg,jpeg,webp,avif} matched by the current glob. Export image="" preserves the present placeholder; upload/select a real example in CMS before replacing it.`);
        return {
          id: plan.id,
          image,
          title: name,
          alt: t('websites.preview', { name }),
          template: t(plan.id === 'free' ? 'websites.freeTemplate' : 'websites.paidTemplate'),
          url: '',
        };
      }),
    },
    pricing: {
      visible: true,
      section_title: t('websites.plansTitle'),
      section_description: t('websites.plansDescription'),
      tariffs: websitePlans.map((plan) => ({
        id: plan.id,
        name: t(`websites.plan.${plan.id}`),
        price: plan.price,
        currency: 'USD',
        billing_type: plan.price === 0 ? 'free' : 'one_time',
        extra_payments_note: t(plan.price === 0 ? 'websites.noExtra' : 'websites.monthly'),
        cta_text: t('websites.choose'),
      })),
      services: websiteServices.map((service) => ({
        id: service,
        text: t(`websites.services.${service}`),
        plans: Object.fromEntries(websitePlans.map((plan) => {
          const serviceKey = getWebsiteServiceKey(plan.id, service);
          return [plan.id, {
            included: Boolean(isWebsiteServiceIncluded(plan.id, service)),
            note: '',
            ...(serviceKey !== service ? { text: t(`websites.services.${serviceKey}`) } : {}),
          }];
        })),
      })),
    },
  };

  const overview = base?.homepage?.website_development_section;
  const configuredOverview = overview?.website_image_src ?? '';
  notes.push(`websites overview: homepage.website_development_section.website_image_src=${JSON.stringify(configuredOverview)} is preserved in the base export and must become the runtime source. Current /websites resolves a separate glob image "overview"=${JSON.stringify(websiteImage('overview'))}, so it can render a placeholder even when the configured CMS/homepage source exists.`);
  const unmatchedFiles = imageFiles.filter((filename) => !matchingFiles.includes(filename));
  if (unmatchedFiles.length) notes.push(`websites image files not matched by the current overview/example glob: ${unmatchedFiles.join(', ')}. No file was assigned to an example by assumption.`);
  notes.push('websites extensions: gallery.section_title and pricing.section_description retain the current headings/introduction. Three gallery entries retain plan IDs/names/template labels; they currently have no external URLs or invented preview images.');
  notes.push('websites.pricing.services[].plans[tariffId].text is a proposed optional full-label override for plan-specific wording (vehicleCatalogLimited, mscoreLimited, mscoreFull). Render this override instead of services[].text when present. note remains a separate optional annotation and is currently empty. included is an explicit exported boolean; CMS must not infer it from service order.');
  notes.push(`websites paid plans are currently displayed as one-time setup prices (${websitePlans.filter((plan) => plan.price > 0).map((plan) => `${plan.id}=${plan.price} USD`).join(', ')}) plus the exact localized extra_payments_note=${JSON.stringify(t('websites.monthly'))}. Preserve both; do not change setup billing_type to monthly or infer a further unlisted price. The UI currently selects a plan ID and scrolls to #trial-request; the form sends that ID as website_package.`);
  notes.push('Website setup tariffs are independent of the unpublished homepage.vortex_pricing_section CRM packages. Do not use website tariffs or the existing calculator to fabricate those future package prices.');

  if (missingKeys.size) notes.push(`${language}: missing source UI keys (exported as empty strings): ${[...missingKeys].sort().join(', ')}.`);
  return { autoshrot, tecdoc, websites, notes };
}

module.exports = { buildSections };
