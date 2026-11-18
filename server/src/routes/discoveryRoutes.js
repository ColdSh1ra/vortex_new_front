const express = require('express');
const contentService = require('../services/contentService');
const { publicPaths, isPageVisible } = require('../services/contentVisibility');
const { origin, languageCodes, staticPaths, localizedUrl, languageFromSearch } = require('../seo/site');
const router = express.Router();
const integrations = Object.fromEntries(Object.keys(languageCodes).map(language => [language, require(`../../../client/src/locales/integrations/${language}.json`)]));
const interfaces = Object.fromEntries(Object.keys(languageCodes).map(language => [language, require(`../../../client/src/locales/${language}.json`)]));
const names = { '/': 'common.home', '/car-service': 'nav.carService', '/websites': 'nav.websites', '/auto-dismantling': 'nav.dismantling', '/tecdoc-license': 'nav.tecdoc', '/faq': 'nav.faq', '/contact': 'nav.contacts', '/privacy-policy': 'common.privacy' };
const plain = text => String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const markdown = text => plain(text).replace(/[\[\]\\]/g, '\\$&');
function pageLabel(path, language, content) {
  return path.startsWith('/integrations/') ? (content.integration_pages?.pages?.[path.split('/').pop()] ?? integrations[language].pages[path.split('/').pop()])?.title ?? path : content.ui[names[path]] ?? interfaces[language][names[path]] ?? path;
}
const robots = `# Public pages and their language variants are crawlable.\nUser-agent: *\nAllow: /\nDisallow: /api/\n\n# Search/retrieval bots use the same public-content rules.\nUser-agent: OAI-SearchBot\nUser-agent: Claude-SearchBot\nUser-agent: PerplexityBot\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
router.get('/robots.txt', (req, res) => res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(robots));
router.get(['/llms.txt', '/llms-full.txt'], async (req, res, next) => {
  try {
    const language = languageFromSearch(new URL(req.originalUrl, origin).search);
    const catalog = await contentService.fetchContent();
    const content = catalog[language];
    const copy = content.integration_pages ?? integrations[language];
    const lines = ['# Vortex', '', `> ${plain(content.homepage.subtitle)}`, '', 'Vortex is business management software for auto parts stores, workshops and vehicle dismantlers. This public guide points to the same pages and facts available to human visitors.', '', `Canonical origin: ${origin}`, `Current language: ${languageCodes[language]}`, `Sitemap: ${origin}/sitemap.xml`, '', '## Pages', ''];
    for (const path of publicPaths(content, staticPaths)) lines.push(`- [${markdown(pageLabel(path, language, content))}](${localizedUrl(path, language)})`);
    lines.push('', '## Language editions', '');
    for (const [code, tag] of Object.entries(languageCodes)) lines.push(`- [${tag}](${localizedUrl('/', code)})`);
    lines.push('', '## API integrations', '', plain(content.homepage.integrations_catalog_section.section_description), '');
    for (const card of content.homepage.integrations_catalog_section.visible === false ? [] : content.homepage.integrations_catalog_section.cards) {
      if (!isPageVisible(content, card.link_href)) continue;
      lines.push(`### ${plain(card.title)}`, '', localizedUrl(card.link_href, language), ...card.features.map(feature => `- ${plain(feature)}`), '');
      if (req.path === '/llms-full.txt') {
        const detail = copy.pages[card.link_href.split('/').pop()];
        if (!detail || detail.visible === false) continue;
        lines.push(plain(detail.lead), '');
        for (const section of detail.sections) lines.push(`#### ${plain(section.title)}`, ...section.paragraphs.map(plain), ...(section.items || []).map(item => `- ${plain(item)}`), '');
        for (const link of detail.links || []) lines.push(`- [${markdown(link.label)}](${link.href})`);
      }
    }
    if (req.path === '/llms-full.txt') {
      lines.push('## Frequently asked questions', '');
      for (const item of content.FAQ) lines.push(`### ${plain(item.topic)}`, plain(item.answer), '');
      lines.push('## Contact', '', localizedUrl('/contact', language));
      for (const worker of content.contacts.workers) lines.push(`- ${plain(worker.contact_topic)}: ${plain(worker.full_name)}, ${plain(worker.phone)}`);
    }
    lines.push('', '## Reading guide', '', 'Follow the canonical page links for current product details, prices and partner offers. Demo blog content is marked noindex and is not a product claim. API endpoints and form submission data are not public documentation.', '', `Expanded public overview: ${localizedUrl('/llms-full.txt', language)}`, '');
    res.type('text/plain').set({ 'Cache-Control': req.cmsPreview ? 'private, no-store' : 'public, max-age=300', 'Content-Language': languageCodes[language], 'X-Robots-Tag': req.cmsPreview ? 'noindex, nofollow, noarchive' : 'noindex, follow' }).send(lines.join('\n'));
  } catch (error) { next(error); }
});
module.exports = router;
