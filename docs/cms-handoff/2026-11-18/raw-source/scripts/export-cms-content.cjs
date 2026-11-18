'use strict';

// Local, read-only snapshot of website content. Does not contact or publish to CMS.
// Run from any directory: node scripts/export-cms-content.cjs
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Module = require('node:module');
const { execFileSync } = require('node:child_process');
const { buildSections } = require('./cms-export-sections.cjs');

const root = path.resolve(__dirname, '..');
process.chdir(root);
const output = path.join(root, 'docs/cms-handoff/2026-11-18');
const publicRoot = path.join(root, 'client/public');
const languages = ['ua', 'cz', 'sk', 'en', 'pl'];
const clientRequire = Module.createRequire(path.join(root, 'client/package.json'));
const esbuild = clientRequire('esbuild');
const ts = clientRequire('typescript');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const clone = value => JSON.parse(JSON.stringify(value));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const writeJson = (file, value) => {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, JSON.stringify(value, null, 2) + '\n');
};
const sourceFiles = new Set();
const record = file => { sourceFiles.add(file); return file; };
const readSourceJson = file => json(record(file));
function evaluate(code, filename) {
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  compiled._compile(code, filename);
  return compiled.exports;
}
function tsText(source, filename) {
  return evaluate(esbuild.transformSync(source, { loader: 'ts', format: 'cjs', target: 'node20' }).code, path.join(root, filename));
}
function tsFile(file) { return tsText(read(record(file)), file); }
function variable(file, name) {
  const source = ts.createSourceFile(file, read(record(file)), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(source) === name) initializer = declaration.initializer?.getText(source);
    }
  }
  if (!initializer) throw new Error(`Missing declaration ${name} in ${file}`);
  return tsText(`export const value = (${initializer});`, file).value;
}

fs.mkdirSync(output, { recursive: true });
const original = readSourceJson('server/data/vortex.json');
const site = readSourceJson('shared/site.json');
const { blogCopy } = tsFile('client/src/blog/copy.ts');
const { seoCopy } = tsFile('client/src/seo/copy.ts');
const { SOCIAL_LINKS } = tsFile('client/src/data/socialLinks.ts');
const network = tsFile('client/src/components/integrations/integrationData.ts');
const sync = tsFile('client/src/components/integrations/syncRoutes.ts');
const apiSource = read(record('client/src/data/apiIntegrations.ts')).split('const copy:')[0].replace(/^import .*;\s*$/gm, '');
const { API_INTEGRATIONS } = tsText(apiSource, 'client/src/data/apiIntegrations.ts');
const plansSource = read(record('client/src/data/websitePlans.ts')).split('// Add overview')[0];
const plans = tsText(plansSource, 'client/src/data/websitePlans.ts');
const billingLabels = variable('client/src/components/VortexPlansComponent.tsx', 'billingLabels');
const oldSeoKeys = { '/': 'home', '/faq': 'faq', '/contact': 'contacts', '/car-service': 'car_service', '/websites': 'websites', '/auto-dismantling': 'autoshrot', '/tecdoc-license': 'tecdoc', '/privacy-policy': 'privacy_policy' };
const defaults = { share_image: '/imgs/logo-square.png', share_image_alt: 'Vortex', indexing: 'index' };
const all = {};
const sectionNotes = {};
const overriddenUiKeys = {};

for (const language of languages) {
  const base = clone(original[language]);
  if (!base) throw new Error(`Missing locale ${language}`);
  const interfaceCopy = readSourceJson(`client/src/locales/${language}.json`);
  const integrationCopy = readSourceJson(`client/src/locales/integrations/${language}.json`);
  const privacy = readSourceJson(`client/src/locales/privacy/${language}.json`);
  // Reflect CURRENT t(): interface translations take precedence over vortex.ui.
  // The handoff requests the opposite precedence after CMS migration.
  overriddenUiKeys[language] = Object.keys(interfaceCopy).filter(key => key in base.ui && interfaceCopy[key] !== base.ui[key]);
  base.ui = { ...original.ua.ui, ...base.ui, ...interfaceCopy, 'nav.blog': blogCopy[language]['nav.blog'] };
  const t = key => {
    if (typeof base.ui[key] !== 'string') throw new Error(`Missing UI key ${language}:${key}`);
    return base.ui[key];
  };
  const visibleSections = ['about_us_block', 'hero_page_slider_section', 'why_vortex_section', 'vortex_audience_section', 'client_testimonials_section', 'integrations_catalog_section', 'car_service_section', 'website_development_section'];
  for (const name of visibleSections) base.homepage[name].visible = true;
  delete base.homepage.why_vortex_showcase_section;
  base.homepage.hero = {
    cta_text: t('common.tryFree'), cta_target: '#trial-request',
    image: '/bgs/logo2.svg', image_alt: 'Vortex',
    screenshots: [1, 2, 3].map(n => ({ image: `/imgs/vx-screenshot-${n}.png`, alt: '' })),
  };
  base.homepage.suppliers_section = {
    visible: true, title: t('network.title'), description: t('network.description'),
    image: '', image_alt: t('network.alt'),
    suppliers: network.integrations.map((item, index) => ({
      id: `supplier-${index + 1}`, name: item.name.startsWith('supplier.') ? t(item.name) : item.name,
      logo: item.imageSrc, logo_alt: item.name.startsWith('supplier.') ? t(item.name) : item.name,
    })),
  };
  base.homepage.sync_section = {
    visible: true, title: t('sync.title'),
    paragraphs: ['first', 'second', 'third', 'fourth'].map(key => t(`sync.${key}`)),
    client_label: t('sync.client'), image: '', image_alt: t('sync.alt'),
  };
  Object.assign(base.homepage.car_service_section, {
    paragraphs: ['first', 'second', 'third'].map(key => t(`carOverview.${key}`)),
    link_text: t('carOverview.link'), link_target: '/car-service',
    image: '/imgs/laptop-screenshot.png', image_alt: t('carOverview.alt'),
  });
  Object.assign(base.homepage.website_development_section, { website_image_alt: t('website.alt'), cta_target: '/websites' });
  base.homepage.vortex_pricing_section.billing_labels = billingLabels[language];
  if (base.homepage.vortex_pricing_section.visible !== false || base.homepage.vortex_pricing_section.plans.length) {
    throw new Error('Approved Vortex plans changed: review export safety before proceeding.');
  }

  const services = [
    ['car-service', 'nav.carService', '/car-service'], ['websites', 'nav.websites', '/websites'],
    ['autoshrot', 'nav.dismantling', '/auto-dismantling'], ['tecdoc', 'nav.tecdoc', '/tecdoc-license'],
  ].map(([id, key, target]) => ({ id, label: t(key), target }));
  const footerMenu = [...services,
    { id: 'pricing', label: t('nav.pricing'), target: '/#pricing' },
    { id: 'faq', label: t('nav.faq'), target: '/faq' },
    { id: 'blog', label: t('nav.blog'), target: '/blog' },
    { id: 'contacts', label: t('nav.contacts'), target: '/contact' },
  ];
  base.layout = {
    header_logo: '/imgs/vortex-logo-115.svg', header_logo_alt: 'Vortex',
    footer_logo: '/imgs/vortex-logo-115.svg', footer_logo_alt: 'Vortex',
    menu: [{ id: 'home', label: t('nav.home'), target: '/' }, ...footerMenu],
    // Proposed extension preserves the actual services dropdown and footer order.
    header_menu: [
      { id: 'home', label: t('nav.home'), target: '/' },
      { id: 'services', label: t('nav.services'), children: services },
      ...footerMenu.slice(services.length),
    ],
    footer_menu: footerMenu,
    buttons: { try_free_text: t('common.tryFree'), try_free_target: '#trial-request', try_demo_text: t('common.tryDemo'), try_demo_target: '#trial-request' },
    socials: SOCIAL_LINKS.map(item => ({ network: item.name.toLowerCase(), url: item.url, label: item.name, icon: item.imageSrc })),
    privacy_text: t('common.privacy'), privacy_link: '/privacy-policy',
    partner_images: [{ image: '/imgs/tecdoc-button.png', alt: t('common.partner'), url: '/tecdoc-license' }],
  };

  const { autoshrot, tecdoc, websites, notes } = buildSections({
    language, base, ui: base.ui, websitePlans: plans.WEBSITE_PLANS, websiteServices: plans.WEBSITE_SERVICES,
    isWebsiteServiceIncluded: plans.isWebsiteServiceIncluded, getWebsiteServiceKey: plans.getWebsiteServiceKey,
  });
  Object.assign(base, { autoshrot, tecdoc, websites });
  sectionNotes[language] = notes;
  base.integration_pages = { visible: true, ...clone(integrationCopy), pages: {} };
  for (const definition of API_INTEGRATIONS) {
    const page = clone(integrationCopy.pages[definition.slug]);
    const card = base.homepage.integrations_catalog_section.cards.find(item => item.link_href === `/integrations/${definition.slug}`);
    const indexes = page.sections.map((_, index) => definition.sectionImageIndexes ? definition.sectionImageIndexes[index] : index);
    base.integration_pages.pages[definition.slug] = {
      ...page, visible: true, slug: definition.slug, path: `/integrations/${definition.slug}`,
      logo: definition.imageSrc, logo_alt: card?.title ?? page.title,
      sections: page.sections.map((section, index) => {
        const imageIndex = indexes[index];
        const image = imageIndex == null ? '' : definition.images[imageIndex] ?? '';
        return { ...section, image, image_alt: image ? section.title : '' };
      }),
      gallery: definition.images.filter((_, index) => !indexes.includes(index)).map((image, index) => ({ image, alt: `${page.title} — ${index + 1}` })),
    };
  }
  base.privacy_policy = { visible: true, ...clone(privacy), updated_at: '2026-11-16' };
  const { title, intro, ...texts } = blogCopy[language];
  base.blog_copy = { title, intro, texts };
  base.seo = Object.fromEntries(Object.entries(oldSeoKeys).map(([route, name]) => [name, { ...seoCopy[language][route], ...defaults }]));
  // These are desired live blog defaults; demo remains noindex independently.
  base.seo.blog = { title, description: intro, ...defaults };
  base.seo.integrations = Object.fromEntries(Object.entries(integrationCopy.pages).map(([slug, page]) => [slug, {
    title: `${page.title} — ${integrationCopy.eyebrow} | Vortex`, description: page.lead, ...defaults,
  }]));
  all[language] = base;
}

writeJson('content.json', all);
for (const language of languages) writeJson(`locales/${language}.json`, all[language]);

// Keep demo fixtures out of the CMS publication document.
const demoFile = record('client/src/blog/demo.ts');
record('client/src/blog/types.ts');
record('client/src/types/content.ts');
const demoModule = evaluate(esbuild.buildSync({ entryPoints: [path.join(root, demoFile)], bundle: true, platform: 'node', format: 'cjs', write: false }).outputFiles[0].text, path.join(root, demoFile));
const demoArticle = variable('client/src/pages/BlogArticlePage.tsx', 'DEMO_BLOG_ARTICLE');
const summaries = demoModule.demoSummaries();
writeJson('reference/demo-blog.json', {
  status: 'demo-only-do-not-publish',
  note: 'No real CMS articles are stored locally. Current demo reuses the base article sections for all20 summary slugs. This file is reference content only.',
  summaries, base_article: demoArticle,
});

const presentation = {
  ownership: 'client-code; reference only; not CMS schema',
  header: { duration_ms: 400, down: 'compact', compact_click: 'expand-scale', up: 'expand-slide', respects_reduced_motion: true },
  sticky_headings: { background_only_when_pinned: true, shadow: false, home: ['about_us_block', 'integrations_catalog_section', 'car_service_section', 'website_development_section'], privacy: 'all section headings; anchors privacy-{id}' },
  hero: { screenshot_layout: 'three images in one row behind content, dimmed; intrinsic height', background_logo: '/bgs/logo2.svg' },
  chevron: { icon: '/icons/double-chevron-right.svg', background: 'HTML div', circle_color: '#ffe4a0' },
  footer: { background: 'dark blue shared with homepage', bottom_spacing: true, blog_transition: 'light-to-dark gradient with spacing' },
  supplier_network: { hub: network.INTEGRATION_HUB_POSITION, nodes: network.integrations },
  sync: {
    viewbox: sync.SYNC_VIEWBOX, routes: sync.SYNC_ROUTES, dots_per_route: 2,
    transfer_durations_seconds: sync.SYNC_ROUTES.map((route, i) => ({ id: route.id, duration: (12 + i * .7) / 1.3 })),
    direction_colors: { 'to-right': '#ffac00', 'to-left': '#ffffff' },
    clients: ['/imgs/3dicons_premium/3dicons-boy-right-premium.png', '/imgs/3dicons_premium/3dicons-boy-left-premium.png'],
    note: 'Dots match their roads. Routes extended to5 each direction; original timing retained. No moving file/cart icons.',
  },
  gallery_glob: '/public/imgs/websites/{overview,example-free,example-practical,example-maximum}.{png,jpg,jpeg,webp,avif}',
  pricing_navigation: { current_route_overrides: { '/car-service': '/car-service#pricing', '/websites': '/websites#pricing' }, default: '/#pricing', future_vortex_plans: '/#vortex-plans' },
  cta_resolution: { current_trial_and_demo: '#trial-request; same form, no distinct submission intent yet', integration_connect: '/contact', integration_features: '#integration-features', integration_back: '/#integrations-catalog' },
};
writeJson('reference/presentation.json', presentation);
writeJson('reference/routes.json', { ...site, languages, blog: { list: '/blog', article: '/blog/{slug}', pagination: '?page={page}', language_query: '?lang={ua|cz|sk|en|pl}' }, integration_slugs: API_INTEGRATIONS.map(item => item.slug) });

// Include exact source bytes to preserve fields overwritten by current UI fallbacks.
const extraSources = [
  'client/src/context/ContentContext.tsx', 'client/src/seo/metadata.ts', 'client/src/seo/urls.ts',
  'client/src/components/MainPageHeroContent.tsx', 'client/src/components/HeroPageSliderSection.tsx',
  'client/src/components/CarServiceOverviewComponent.tsx', 'client/src/components/WebsiteDevelopmentComponent.tsx',
  'client/src/components/layout/HeaderMain.tsx', 'client/src/components/layout/FooterMain.tsx', 'client/src/components/layout/ServicesDropdown.tsx',
  'client/src/pages/AutoDismantlingPage.tsx', 'client/src/pages/TecDocLicensePage.tsx', 'client/src/pages/WebsiteDevelopmentPage.tsx',
  'client/src/pages/PrivacyPolicyPage.tsx', 'client/src/pages/IntegrationPage.tsx',
  'client/src/components/integrations/VortexSyncComponent.tsx', 'client/src/components/integrations/IntegrationsNetworkComponent.tsx',
  'client/src/components/default/ChevronCircle.tsx', 'client/src/components/default/StickyHeading.tsx', 'client/src/utils/useStickyHeading.ts',
  'client/src/styles/base.css', 'client/src/styles/main.css', 'client/src/styles/privacy.css',
  'client/src/styles/blog.css', 'client/src/styles/auto-dismantling.css', 'client/src/styles/tecdoc.css',
  'client/src/styles/websites.css', 'client/src/styles/integrations.css', 'client/src/styles/vortex-plans.css',
  'client/src/blog/loadBlogRoute.ts', 'client/src/blog/urls.ts',
  'docs/blog-api-sashko.md', 'docs/vortex-plans.md', 'docs/SEO.md',
  'scripts/export-cms-content.cjs', 'scripts/cms-export-sections.cjs',
];
for (const file of extraSources) record(file);
for (const file of [...sourceFiles].sort()) {
  const destination = path.join(output, 'raw-source', file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
}

// Media: collect content URLs plus assets referenced by current component/style code.
// No .env, server user data, browser tokens, network requests or external downloads.
const references = new Map();
function addMedia(url, source, language, alt) {
  if (typeof url !== 'string' || !/^\/(?:imgs|icons|bgs|files)\//.test(url)) return;
  const key = url.split(/[?#]/)[0];
  if (/[{}*]/.test(key) || !path.extname(key) || key.endsWith('/')) return;
  const entry = references.get(key) ?? { sources: new Set(), alt: Object.fromEntries(languages.map(l => [l, ''])) };
  entry.sources.add(source);
  if (language && typeof alt === 'string' && alt) entry.alt[language] ||= alt;
  references.set(key, entry);
}
function walk(value, pointer, language) {
  if (Array.isArray(value)) return value.forEach((item, i) => walk(item, `${pointer}/${i}`, language));
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      let alt;
      if (key === 'image_src') alt = value.image_alt ?? value.alt ?? value.title;
      else if (key === 'image' || key === 'website_image_src') alt = value.image_alt ?? value.website_image_alt ?? value.alt;
      else if (key === 'logo') alt = value.logo_alt;
      else if (key === 'header_logo' || key === 'footer_logo') alt = value[`${key}_alt`];
      addMedia(item, `${pointer}/${key}`, language, alt);
      walk(item, `${pointer}/${key}`, language);
    }
  } else if (typeof value === 'string') {
    for (const match of value.matchAll(/\/(?:imgs|icons|bgs|files)\/[^\s"'<>`)}\]\\]+/g)) addMedia(match[0], pointer, language);
  }
}
for (const language of languages) walk(all[language], `content/${language}`, language);
walk(presentation, 'reference/presentation');
walk(summaries, 'reference/demo-blog/summaries');
walk(demoArticle, 'reference/demo-blog/base_article');
function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(file) : [file];
  });
}
for (const absolute of listFiles(path.join(root, 'client/src')).filter(file => /\.(tsx?|css)$/.test(file))) {
  const file = path.relative(root, absolute);
  for (const match of fs.readFileSync(absolute, 'utf8').matchAll(/\/(?:imgs|icons|bgs|files)\/[^\s"'<>`)}\]\\]+/g)) addMedia(match[0], file);
}
const localFiles = [...references.keys()].filter(url => fs.existsSync(path.join(publicRoot, url))).sort();
const dimensions = JSON.parse(execFileSync('python3', ['-c', String.raw`
import json,sys,os,re,mimetypes,xml.etree.ElementTree as ET
from PIL import Image
base=sys.argv[1]
results={}
for url in json.load(sys.stdin):
    file=os.path.join(base,url.lstrip('/'))
    result={'width':None,'height':None,'mime':mimetypes.guess_type(file)[0] or 'application/octet-stream'}
    try:
        with Image.open(file) as im:
            result.update(width=im.width,height=im.height,mime=Image.MIME.get(im.format,result['mime']))
    except Exception:
        if file.endswith('.svg'):
            element=ET.parse(file).getroot()
            vb=element.attrib.get('viewBox','').replace(',',' ').split()
            def number(s):
                return float(s) if re.fullmatch(r'[\d.]+',s) else None
            w=number(element.attrib.get('width',''))
            h=number(element.attrib.get('height',''))
            if len(vb)==4:
                w=w or float(vb[2]); h=h or float(vb[3])
            result.update(width=w,height=h,mime='image/svg+xml')
    results[url]=result
print(json.dumps(results))
`, publicRoot], { input: JSON.stringify(localFiles), encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 }));

const media = [];
const missingMedia = [];
for (const [url, reference] of [...references.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const absolute = path.resolve(publicRoot, `.${url}`);
  if (!absolute.startsWith(`${publicRoot}${path.sep}`)) throw new Error(`Invalid media URL ${url}`);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) { missingMedia.push({ url, sources: [...reference.sources].sort() }); continue; }
  const bytes = fs.readFileSync(absolute);
  const bundledPath = `media${url}`;
  const destination = path.join(output, bundledPath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
  media.push({ url, bundled_path: bundledPath, ...dimensions[url], size: bytes.length, sha256: hash(bytes), alt: reference.alt, sources: [...reference.sources].sort(), variants: [] });
}
writeJson('media-manifest.json', { scope: 'Referenced current content, presentation assets and separately marked demo covers. Local originals only; no generated variants.', files: media, missing: missingMedia });
writeJson('media-response.example.json', { data: Object.fromEntries(media.filter(item => item.mime.startsWith('image/')).map(({ url, width, height, mime, size, alt, variants }) => [url, { width, height, mime, size, alt, variants }])) });

const placeholders = [];
function inspect(value, pointer) {
  if (Array.isArray(value)) return value.forEach((item, i) => inspect(item, `${pointer}/${i}`));
  if (value && typeof value === 'object') return Object.entries(value).forEach(([key, item]) => inspect(item, `${pointer}/${key}`));
  if (typeof value === 'string' && /lorem ipsum|blank_image/i.test(value)) placeholders.push({ path: pointer, value });
}
inspect(all, 'content');
const sourceManifest = [...sourceFiles].sort().map(file => {
  const bytes = fs.readFileSync(path.join(root, file));
  return { path: file, snapshot_path: `raw-source/${file}`, size: bytes.length, sha256: hash(bytes) };
});
writeJson('export-report.json', {
  schema_status: 'Proposed CMS import snapshot, not a claim that production API already implements it.',
  snapshot_date: '2026-11-18', languages, language_codes: site.languageCodes,
  counts: Object.fromEntries(languages.map(language => [language, {
    interface_keys: Object.keys(all[language].ui).length,
    integration_cards: all[language].homepage.integrations_catalog_section.cards.length,
    integration_pages: Object.keys(all[language].integration_pages.pages).length,
    privacy_sections: all[language].privacy_policy.sections.length,
    website_plans: all[language].websites.pricing.tariffs.length,
    website_services: all[language].websites.pricing.services.length,
    vortex_plans: all[language].homepage.vortex_pricing_section.plans.length,
    suppliers: all[language].homepage.suppliers_section.suppliers.length,
    faq: all[language].FAQ.length,
  }])),
  source_manifest: sourceManifest, current_ui_overrides: overriddenUiKeys,
  proposed_extensions: [
    'integration_pages', 'privacy_policy', 'seo.privacy_policy', 'seo.integrations[slug]',
    'homepage.vortex_pricing_section and billing_labels',
    'layout.header_menu, layout.footer_menu, layout.socials[].icon',
    'autoshrot.navigation.label, car/statuses/removal.eyebrow, anchor_aliases',
    'tecdoc.license, hero.secondary_cta_text/target, hero.details, sections[].eyebrow/blocks',
    'websites.gallery.section_title, websites.pricing.section_description, services[].plans[id].text',
  ],
  section_mapping_notes: sectionNotes,
  media: { files: media.length, total_bytes: media.reduce((sum, item) => sum + item.size, 0), missing: missingMedia },
  placeholders,
  limitations: [
    'No real CMS endpoint, authenticated preview token or staging response was provided or verified. No content was published.',
    'New structured fields are proposed extensions. The current site still reads local source files and code, and does not consume all fields in this export.',
    'homepage.vortex_pricing_section remains visible=false and plans=[] in all5 locales. No commercial packages or prices invented.',
    'Website prices0/300/500 USD and TecDoc25 EUR/month are existing code values, not newly approved commercial offers. Retain current annual advance-payment and extra request charges.',
    'Subpage website image glob has no matching files. Three gallery images and overview are empty placeholders; homepage site_2.png is a real, used image.',
    'Demo blog20 summaries and one5locale base article are reference/demo-blog.json only, excluded from content.json. Do not import as real published posts.',
    'seo.blog describes intended live defaults; actual demo pages remain noindex,follow. Current SEO otherwise uses code and current default96x96 logo.',
    'Presentation, CSS, animations, conditional sticky backgrounds and responsive header transitions remain client code, not arbitrary CMS HTML.',
    'Public media URLs are preserved. Move them to absolute CMS URLs consistently on import if hosting changes. No webp/thumb variants have been generated.',
    'Media alt strings preserve supplied/rendered copy; empty alts can be intentional decorative images. Sources list includes code-only assets as well as publishable content.',
  ],
});
console.log(JSON.stringify({ output: path.relative(root, output), locales: languages.length, integration_pages: API_INTEGRATIONS.length, privacy_sections: all.ua.privacy_policy.sections.length, media_files: media.length, missing_media: missingMedia.length, placeholder_values: placeholders.length }));
