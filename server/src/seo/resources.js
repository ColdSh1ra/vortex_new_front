const fs = require('node:fs/promises');
const path = require('node:path');
const { languageFromSearch } = require('./site');
const publicRoot = path.join(__dirname, '../../..', 'client/public');
const distRoot = path.join(__dirname, '../../..', 'client/dist/client');
const manifestPath = path.join(distRoot, '.vite/manifest.json');
let manifestCache;
let manifestMtime;
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function routeStyles(pathname) {
  if (pathname === '/privacy-policy') return ['privacy'];
  if (pathname.startsWith('/integrations/')) return ['integrations'];
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return ['blog'];
  if (pathname === '/faq') return ['faq'];
  if (pathname === '/contact') return ['contact', 'trial-request'];
  if (pathname === '/car-service') return ['pricing-calculator', 'car-service', 'trial-request'];
  if (pathname === '/websites') return ['websites', 'trial-request'];
  if (pathname === '/auto-dismantling') return ['auto-dismantling', 'trial-request'];
  if (pathname === '/tecdoc-license') return ['tecdoc', 'trial-request'];
  return pathname === '/' ? ['main', 'vortex-plans', 'pricing-calculator', 'trial-request'] : [];
}

async function manifest() {
  const stat = await fs.stat(manifestPath);
  if (manifestMtime !== stat.mtimeMs) {
    manifestCache = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    manifestMtime = stat.mtimeMs;
  }
  return manifestCache;
}

async function primaryImage(pathname, content, blog) {
  if (pathname === '/') return content?.homepage.hero?.screenshots?.[1]?.image ?? '/imgs/vx-screenshot-2.png';
  if (pathname === '/auto-dismantling') return content?.autoshrot?.hero?.image ?? '/imgs/auto-dismantling/dismantling-car-premium.png';
  if (pathname === '/car-service') return content?.car_service.blocks[0]?.image_src;
  if (pathname === '/contact') return content?.contacts.workers[0]?.photo_path;
  if (pathname.startsWith('/integrations/')) return content?.integration_pages?.pages?.[pathname.split('/').pop()]?.logo ?? content?.homepage.integrations_catalog_section.cards.find(card => card.link_href === pathname)?.image_src;
  if (pathname.startsWith('/blog')) return blog?.article?.cover.url || blog?.list?.data[0]?.cover.url;
  if (pathname === '/websites') {
    if (content?.websites !== undefined) return content.homepage.website_development_section.website_image_src;
    const files = await fs.readdir(path.join(publicRoot, 'imgs/websites')).catch(() => []);
    const overview = files.find(file => /^overview\.(png|jpe?g|webp|avif)$/.test(file));
    if (overview) return `/imgs/websites/${overview}`;
  }
  return undefined;
}

async function routeResources(url, catalog, blog, template = '') {
  const parsed = new URL(url, 'https://crm-vortex.com');
  const pathname = parsed.pathname.replace(/\/$/, '') || '/';
  const build = await manifest();
  const entry = Object.values(build).find(item => item.isEntry);
  const css = new Set(entry?.css || []);
  const routeCss = new Set();
  for (const name of routeStyles(pathname)) {
    const item = build[`src/styles/${name}.css`];
    for (const file of item?.css || (item?.file.endsWith('.css') ? [item.file] : [])) { css.add(file); routeCss.add(file); }
  }
  const scripts = new Set();
  function collect(item) {
    if (!item || scripts.has(item.file)) return;
    if (item.file.endsWith('.js')) scripts.add(item.file);
    for (const key of item.imports || []) collect(build[key]);
  }
  collect(entry);
  const hints = [...css].map(file => `<link rel="preload" as="style" crossorigin href="/${escape(file)}">`);
  hints.push(...[...scripts].filter(file => !template.includes(`href="/${file}"`)).map(file => `<link rel="modulepreload" crossorigin href="/${escape(file)}">`));
  const image = await primaryImage(pathname, catalog[languageFromSearch(parsed.search)], blog);
  if (image) {
    const isRemote = /^https?:\/\//.test(image);
    const available = isRemote || await fs.access(path.join(publicRoot, image)).then(() => true, () => false);
    if (available) hints.push(`<link rel="preload" as="image" fetchpriority="high" href="${escape(image)}">`);
  }
  return { hints: hints.join(''), styles: [...routeCss].map(file => `<link rel="stylesheet" crossorigin href="/${escape(file)}">`).join('') };
}
module.exports = { routeResources };
