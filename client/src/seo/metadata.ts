import type { BlogResource } from '../blog/types';
import { blogRoute } from '../blog/types';
import { blogText } from '../blog/copy';
import { blogLanguage, blogUrl, LANGUAGE_CODES, SITE_URL } from '../blog/urls';
import type { Language } from '../types/content';
import { LANGUAGES } from '../types/content';
export type PageSeo = { title: string; description: string; canonical: string; language: Language; robots: string; status: number; image: string; type: string; alternates: { language: string; url: string }[]; schemas: object[]; publishedAt?: string; updatedAt?: string };
const staticPages = new Set(['/', '/contact', '/faq', '/car-service', '/websites', '/auto-dismantling', '/tecdoc-license']);
export function buildPageSeo(url: string, currentLanguage: Language, resource: BlogResource | null): PageSeo {
  const parsed = new URL(url, SITE_URL);
  const route = blogRoute(url);
  const language = route ? blogLanguage(parsed.search) : currentLanguage;
  const organization = { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Vortex', url: SITE_URL, logo: `${SITE_URL}/imgs/logo-square.png` };
  const seo: PageSeo = { title: blogText(language, 'homeTitle'), description: blogText(language, 'homeDescription'), canonical: SITE_URL + parsed.pathname, language, robots: 'index,follow,max-image-preview:large', status: 200, image: `${SITE_URL}/imgs/logo-square.png`, type: 'website', alternates: [], schemas: [] };
  if (!route) {
    if (!staticPages.has(parsed.pathname)) { seo.status = 404; seo.robots = 'noindex,follow'; seo.title = `${blogText(language, 'missing')} | Vortex`; }
    if (parsed.pathname === '/') seo.schemas = [{ '@context': 'https://schema.org', '@graph': [organization, { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: 'Vortex', publisher: { '@id': organization['@id'] }, inLanguage: LANGUAGE_CODES[language] }, { '@type': 'SoftwareApplication', '@id': `${SITE_URL}/#software`, name: 'Vortex', url: SITE_URL, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: seo.description, publisher: { '@id': organization['@id'] } }, { '@type': 'WebPage', '@id': `${SITE_URL}/#webpage`, url: SITE_URL, name: seo.title, isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/#software` }, inLanguage: LANGUAGE_CODES[language] }] }];
    return seo;
  }
  const page = route.page || 1;
  const slug = resource?.article?.slug ?? route.slug ?? undefined;
  seo.canonical = SITE_URL + blogUrl(language, slug, page);
  seo.title = `${blogText(language, 'title')}${page > 1 ? ` — ${blogText(language, 'page', { page })}` : ''}`;
  seo.description = blogText(language, 'intro');
  if (!resource || resource.status !== 'ready') {
    seo.robots = 'noindex,follow';
    seo.status = resource?.status === 'not-found' ? 404 : 503;
    seo.title = `${blogText(language, resource?.status === 'not-found' ? 'missing' : 'error')} | Vortex`;
    return seo;
  }
  seo.alternates = [...LANGUAGES.map(code => ({ language: LANGUAGE_CODES[code], url: SITE_URL + blogUrl(code, slug, page) })), { language: 'x-default', url: SITE_URL + blogUrl('ua', slug, page) }];
  if (resource.mode === 'demo') seo.robots = 'noindex,follow';
  const breadcrumbs = [{ '@type': 'ListItem', position: 1, name: 'Vortex', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: blogText(language, 'nav.blog'), item: SITE_URL + blogUrl(language) }];
  if (resource.article) {
    const article = resource.article;
    const translation = article.translations[language];
    seo.title = translation.seo.title;
    seo.description = translation.seo.description;
    seo.image = new URL(article.cover.url, SITE_URL).href;
    seo.type = 'article';
    seo.publishedAt = article.publishedAt;
    seo.updatedAt = article.updatedAt;
    breadcrumbs.push({ '@type': 'ListItem', position: 3, name: translation.title, item: seo.canonical });
    if (resource.mode === 'live') seo.schemas.push({ '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${seo.canonical}#article`, headline: translation.title, description: translation.excerpt, image: [{ '@type': 'ImageObject', url: seo.image, width: article.cover.width, height: article.cover.height }], author: { '@type': article.author.type, name: article.author.name }, publisher: organization, datePublished: article.publishedAt, dateModified: article.updatedAt, inLanguage: LANGUAGE_CODES[language], mainEntityOfPage: { '@type': 'WebPage', '@id': seo.canonical }, articleBody: translation.sections.map(section => `${section.heading}\n${section.paragraphs.join('\n')}`).join('\n\n') });
  } else if (resource.list && resource.mode === 'live') seo.schemas.push({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: seo.title, url: seo.canonical, inLanguage: LANGUAGE_CODES[language], mainEntity: { '@type': 'ItemList', itemListElement: resource.list.data.map((post, index) => ({ '@type': 'ListItem', position: (page - 1) * 16 + index + 1, url: SITE_URL + blogUrl(language, post.slug), name: post.translations[language].title })) } });
  seo.schemas.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs });
  return seo;
}
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function seoElements(seo: PageSeo) {
  const items: { tag: string; attributes: Record<string, string>; text?: string }[] = [
    { tag: 'title', attributes: {}, text: seo.title },
    ...Object.entries({ description: seo.description, robots: seo.robots, 'twitter:card': 'summary_large_image', 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': seo.image }).map(([name, content]) => ({ tag: 'meta', attributes: { name, content } })),
    ...Object.entries({ 'og:title': seo.title, 'og:description': seo.description, 'og:type': seo.type, 'og:url': seo.canonical, 'og:image': seo.image, 'og:site_name': 'Vortex', 'og:locale': { ua: 'uk_UA', cz: 'cs_CZ', sk: 'sk_SK', en: 'en_US', pl: 'pl_PL' }[seo.language], ...(seo.publishedAt ? { 'article:published_time': seo.publishedAt, 'article:modified_time': seo.updatedAt! } : {}) }).map(([property, content]) => ({ tag: 'meta', attributes: { property, content } })),
    { tag: 'link', attributes: { rel: 'canonical', href: seo.canonical } },
    ...seo.alternates.map(item => ({ tag: 'link', attributes: { rel: 'alternate', hreflang: item.language, href: item.url } })),
    ...seo.schemas.map(schema => ({ tag: 'script', attributes: { type: 'application/ld+json' }, text: JSON.stringify(schema).replace(/</g, '\\u003c') })),
  ];
  return items;
}
export function renderSeoHead(seo: PageSeo) {
  return seoElements(seo).map(item => `<${item.tag} data-vortex-seo="true" ${Object.entries(item.attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(' ')}>${item.tag === 'script' ? item.text : escape(item.text ?? '')}${['meta', 'link'].includes(item.tag) ? '' : `</${item.tag}>`}`).join('');
}
