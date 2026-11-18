import type { BlogResource } from '../blog/types';
import { blogRoute } from '../blog/types';
import { blogText } from '../blog/copy';
import { blogUrl } from '../blog/urls';
import type { ContentCatalog, Language, VortexContent } from '../types/content';
import { LANGUAGES } from '../types/content';
import { getApiIntegration, getIntegrationCopy } from '../data/apiIntegrations';
import { interfaceTranslations } from '../locales';
import site from '../../../shared/site.json';
import { seoCopy } from './copy';
import { languageFromSearch, localizedUrl } from './urls';

export type PageSeo = {
  title: string;
  description: string;
  canonical: string;
  language: Language;
  robots: string;
  status: number;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  type: string;
  alternates: { language: string; url: string }[];
  schemas: object[];
  publishedAt?: string;
  updatedAt?: string;
  previous?: string;
  next?: string;
};

type SchemaNode = Record<string, unknown>;
type Breadcrumb = { name: string; url: string };
const SITE_URL = site.origin;
const LANGUAGE_CODES: Record<Language, string> = site.languageCodes;
const INDEX_ROBOTS = 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';
const OG_LOCALES: Record<Language, string> = { ua: 'uk_UA', cz: 'cs_CZ', sk: 'sk_SK', en: 'en_US', pl: 'pl_PL' };
const absolute = (path: string) => new URL(path, SITE_URL).href;
const localizedAbsolute = (path: string, language: Language) => absolute(localizedUrl(path, language));

function plainText(html: string) {
  const entities: Record<string, string> = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return html.replace(/<[^>]+>/g, ' ').replace(/&([a-z]+);/gi, (match, entity: string) => entities[entity.toLowerCase()] ?? match)
    .replace(/&#(x[\da-f]+|\d+);/gi, (match, value: string) => {
      const code = value[0].toLowerCase() === 'x' ? parseInt(value.slice(1), 16) : Number(value);
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }).replace(/\s+/g, ' ').trim();
}

function translatedLabel(language: Language, content: VortexContent | undefined, key: string, fallback: string) {
  return interfaceTranslations[language][key] ?? content?.ui[key] ?? fallback;
}

function languageAlternates(path: string) {
  return [...LANGUAGES.map(language => ({ language: LANGUAGE_CODES[language], url: localizedAbsolute(path, language) })),
    { language: 'x-default', url: localizedAbsolute(path, 'ua') }];
}

function buildGraph(seo: PageSeo, content: VortexContent | undefined, pageType: string, breadcrumbs: Breadcrumb[], extra: SchemaNode[], pageProperties: SchemaNode) {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const webPageId = `${seo.canonical}#webpage`;
  const organization: SchemaNode = {
    '@type': 'Organization', '@id': organizationId, name: 'Vortex', url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/imgs/logo-square.png`, width: 96, height: 96 },
  };
  const contacts = content?.contacts.workers.map(worker => ({
    '@type': 'ContactPoint', telephone: worker.phone, contactType: worker.contact_topic,
    ...(worker.messenger_links.email ? { email: worker.messenger_links.email.replace(/^mailto:/, '') } : {}),
  })).filter(contact => contact.telephone);
  if (contacts?.length) organization.contactPoint = contacts;

  const graph: SchemaNode[] = [
    organization,
    { '@type': 'WebSite', '@id': websiteId, url: SITE_URL, name: 'Vortex', publisher: { '@id': organizationId }, inLanguage: Object.values(LANGUAGE_CODES) },
    { '@type': 'ImageObject', '@id': `${seo.canonical}#primaryimage`, url: seo.image, contentUrl: seo.image, caption: seo.imageAlt,
      ...(seo.imageWidth ? { width: seo.imageWidth, height: seo.imageHeight } : {}) },
    { '@type': pageType, '@id': webPageId, url: seo.canonical, name: seo.title, description: seo.description,
      inLanguage: LANGUAGE_CODES[seo.language], isPartOf: { '@id': websiteId }, publisher: { '@id': organizationId },
      primaryImageOfPage: { '@id': `${seo.canonical}#primaryimage` },
      ...(breadcrumbs.length ? { breadcrumb: { '@id': `${seo.canonical}#breadcrumb` } } : {}),
      ...(seo.publishedAt ? { datePublished: seo.publishedAt, dateModified: seo.updatedAt } : {}),
      ...pageProperties },
    ...extra,
  ];
  if (breadcrumbs.length) graph.push({
    '@type': 'BreadcrumbList', '@id': `${seo.canonical}#breadcrumb`, itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem', position: index + 1, name: crumb.name, item: crumb.url,
    })),
  });
  seo.schemas = [{ '@context': 'https://schema.org', '@graph': graph }];
}

export function buildPageSeo(url: string, currentLanguage: Language, resource: BlogResource | null, catalog: ContentCatalog | null = null): PageSeo {
  const parsed = new URL(url, SITE_URL);
  const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
  const language = parsed.searchParams.has('lang') ? languageFromSearch(parsed.search) : currentLanguage;
  const content = catalog?.[language];
  const label = (key: string, fallback: string) => translatedLabel(language, content, key, fallback);
  const fallback = seoCopy[language]['/'];
  const seo: PageSeo = {
    title: fallback.title, description: fallback.description, canonical: localizedAbsolute(pathname, language), language,
    robots: INDEX_ROBOTS, status: 200, image: `${SITE_URL}/imgs/logo-square.png`, imageAlt: 'Vortex', imageWidth: 96, imageHeight: 96,
    type: 'website', alternates: [], schemas: [],
  };
  const homeCrumb = { name: label('common.home', 'Vortex'), url: localizedAbsolute('/', language) };
  const breadcrumbs: Breadcrumb[] = [];
  const extra: SchemaNode[] = [];
  const pageProperties: SchemaNode = {};
  let pageType = 'WebPage';
  let alternatePath = pathname;
  let serviceName: string | undefined;
  const route = blogRoute(url);

  if (route) {
    const page = route.page || 1;
    const slug = resource?.article?.slug ?? route.slug ?? undefined;
    alternatePath = blogUrl('ua', slug, page);
    seo.canonical = absolute(blogUrl(language, slug, page));
    seo.title = `${blogText(language, 'title')}${page > 1 ? ` — ${blogText(language, 'page', { page })}` : ''}`;
    seo.description = blogText(language, 'intro');
    breadcrumbs.push(homeCrumb, { name: blogText(language, 'nav.blog'), url: absolute(blogUrl(language)) });
    if (!resource || resource.status !== 'ready') {
      seo.status = resource?.status === 'not-found' ? 404 : 503;
      seo.robots = 'noindex,follow';
      seo.title = `${blogText(language, resource?.status === 'not-found' ? 'missing' : 'error')} | Vortex`;
    } else {
      if (resource.mode === 'demo') seo.robots = 'noindex,follow';
      if (resource.article) {
        const article = resource.article;
        const translation = article.translations[language];
        seo.title = translation.seo.title;
        seo.description = translation.seo.description;
        seo.image = absolute(article.cover.url);
        seo.imageAlt = article.cover.alt[language];
        seo.imageWidth = article.cover.width;
        seo.imageHeight = article.cover.height;
        seo.type = 'article';
        seo.publishedAt = article.publishedAt;
        seo.updatedAt = article.updatedAt;
        breadcrumbs.push({ name: translation.title, url: seo.canonical });
        if (resource.mode === 'live') {
          pageProperties.mainEntity = { '@id': `${seo.canonical}#article` };
          extra.push({
            '@type': 'BlogPosting', '@id': `${seo.canonical}#article`, headline: translation.title, description: translation.excerpt,
            image: { '@id': `${seo.canonical}#primaryimage` }, author: { '@type': article.author.type, name: article.author.name },
            publisher: { '@id': `${SITE_URL}/#organization` }, datePublished: article.publishedAt, dateModified: article.updatedAt,
            inLanguage: LANGUAGE_CODES[language], mainEntityOfPage: { '@id': `${seo.canonical}#webpage` },
            articleBody: translation.sections.map(section => `${section.heading}\n${section.paragraphs.join('\n')}`).join('\n\n'),
          });
        }
      } else if (resource.list) {
        pageType = 'CollectionPage';
        if (resource.mode === 'live') pageProperties.mainEntity = {
          '@type': 'ItemList', itemListElement: resource.list.data.map((post, index) => ({
            '@type': 'ListItem', position: (page - 1) * resource.list!.pagination.limit + index + 1,
            url: absolute(blogUrl(language, post.slug)), name: post.translations[language].title,
          })),
        };
        if (page > 1) seo.previous = absolute(blogUrl(language, undefined, page - 1));
        if (page < resource.list.pagination.totalPages) seo.next = absolute(blogUrl(language, undefined, page + 1));
      }
    }
  } else {
    const copy = seoCopy[language][pathname];
    const integration = getApiIntegration(pathname.match(/^\/integrations\/([^/]+)$/)?.[1]);
    if (copy) {
      seo.title = copy.title;
      seo.description = copy.description;
      const breadcrumbKeys: Record<string, string> = {
        '/contact': 'nav.contacts', '/faq': 'nav.faq', '/car-service': 'nav.carService', '/websites': 'nav.websites',
        '/auto-dismantling': 'nav.dismantling', '/tecdoc-license': 'nav.tecdoc', '/privacy-policy': 'common.privacy',
      };
      const pageName = pathname === '/car-service' ? content?.car_service.title ?? label('nav.carService', copy.title)
        : label(breadcrumbKeys[pathname] ?? '', copy.title.replace(/\s*\| Vortex$/, ''));
      if (pathname !== '/') breadcrumbs.push(homeCrumb, { name: pageName, url: seo.canonical });
      if (pathname === '/') {
        pageProperties.about = { '@id': `${seo.canonical}#software` };
        pageProperties.mainEntity = { '@id': `${seo.canonical}#software` };
        extra.push({ '@type': 'SoftwareApplication', '@id': `${seo.canonical}#software`, name: 'Vortex', url: seo.canonical,
          applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', description: seo.description,
          publisher: { '@id': `${SITE_URL}/#organization` }, inLanguage: LANGUAGE_CODES[language],
          ...(content ? { featureList: content.homepage.why_vortex_section.cards.map(card => card.title) } : {}) });
      } else if (pathname === '/contact') {
        pageType = 'ContactPage';
        pageProperties.mainEntity = { '@id': `${SITE_URL}/#organization` };
      } else if (pathname === '/faq') {
        pageType = 'FAQPage';
        pageProperties.mainEntity = (content?.FAQ ?? []).map(item => ({ '@type': 'Question', name: plainText(item.topic),
          acceptedAnswer: { '@type': 'Answer', text: plainText(item.answer) } }));
      } else if (pathname !== '/privacy-policy') serviceName = pageName;
    } else if (integration) {
      const copy = getIntegrationCopy(language);
      const page = copy.pages[integration.slug];
      const card = content?.homepage.integrations_catalog_section.cards.find(item => item.link_href === `/integrations/${integration.slug}`);
      seo.title = `${page.title} — ${copy.eyebrow} | Vortex`;
      seo.description = page.lead;
      serviceName = page.title;
      breadcrumbs.push(homeCrumb, { name: copy.label, url: localizedAbsolute('/#integrations-catalog', language) }, { name: card?.title ?? page.title, url: seo.canonical });
    } else {
      seo.status = 404;
      seo.robots = 'noindex,follow';
      seo.title = `${blogText(language, 'missing')} | Vortex`;
    }
  }

  if (serviceName) {
    pageProperties.mainEntity = { '@id': `${seo.canonical}#service` };
    extra.push({ '@type': 'Service', '@id': `${seo.canonical}#service`, name: serviceName, serviceType: serviceName,
      description: seo.description, url: seo.canonical, provider: { '@id': `${SITE_URL}/#organization` },
      mainEntityOfPage: { '@id': `${seo.canonical}#webpage` } });
  }
  if (seo.status === 200 && !seo.robots.startsWith('noindex')) seo.alternates = languageAlternates(alternatePath);
  buildGraph(seo, content, pageType, breadcrumbs, extra, pageProperties);
  return seo;
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function seoElements(seo: PageSeo) {
  const largeImage = (seo.imageWidth ?? 0) >= 300 && (seo.imageHeight ?? 0) >= 157;
  const items: { tag: string; attributes: Record<string, string>; text?: string }[] = [
    { tag: 'title', attributes: {}, text: seo.title },
    ...Object.entries({ description: seo.description, robots: seo.robots, 'twitter:card': largeImage ? 'summary_large_image' : 'summary',
      'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': seo.image, 'twitter:image:alt': seo.imageAlt })
      .map(([name, content]) => ({ tag: 'meta', attributes: { name, content } })),
    ...Object.entries({ 'og:title': seo.title, 'og:description': seo.description, 'og:type': seo.type, 'og:url': seo.canonical,
      'og:image': seo.image, 'og:image:alt': seo.imageAlt, 'og:site_name': 'Vortex', 'og:locale': OG_LOCALES[seo.language],
      ...(seo.imageWidth ? { 'og:image:width': String(seo.imageWidth), 'og:image:height': String(seo.imageHeight) } : {}),
      ...(seo.publishedAt ? { 'article:published_time': seo.publishedAt, 'article:modified_time': seo.updatedAt! } : {}) })
      .map(([property, content]) => ({ tag: 'meta', attributes: { property, content } })),
    ...LANGUAGES.filter(language => language !== seo.language).map(language => ({ tag: 'meta', attributes: { property: 'og:locale:alternate', content: OG_LOCALES[language] } })),
    { tag: 'link', attributes: { rel: 'canonical', href: seo.canonical } },
    ...seo.alternates.map(item => ({ tag: 'link', attributes: { rel: 'alternate', hreflang: item.language, href: item.url } })),
    ...(seo.previous ? [{ tag: 'link', attributes: { rel: 'prev', href: seo.previous } }] : []),
    ...(seo.next ? [{ tag: 'link', attributes: { rel: 'next', href: seo.next } }] : []),
    ...seo.schemas.map(schema => ({ tag: 'script', attributes: { type: 'application/ld+json' }, text: JSON.stringify(schema).replace(/</g, '\\u003c') })),
  ];
  return items;
}

export function renderSeoHead(seo: PageSeo) {
  return seoElements(seo).map(item => {
    const attributes = Object.entries(item.attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(' ');
    const opening = `<${item.tag} data-vortex-seo="true"${attributes ? ` ${attributes}` : ''}>`;
    if (item.tag === 'meta' || item.tag === 'link') return opening;
    return `${opening}${item.tag === 'script' ? item.text : escape(item.text ?? '')}</${item.tag}>`;
  }).join('');
}
