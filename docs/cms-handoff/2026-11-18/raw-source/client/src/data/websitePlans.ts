export const WEBSITE_SERVICES = [
  'productSearch', 'catalogSearch', 'liqpay', 'feedback', 'colors', 'account',
  'orders', 'shipments', 'balances', 'appointments', 'slider', 'design', 'garage',
  'vehicleCatalog', 'customization', 'favorites', 'ratings', 'invoiceHistory',
  'searchHistory', 'sitemap', 'seo', 'mscore', 'fluids', 'catalogGroups', 'blog',
  'homepage', 'header',
] as const;

export const WEBSITE_PLANS = [
  { id: 'free', price: 0 },
  { id: 'practical', price: 300 },
  { id: 'maximum', price: 500 },
] as const;

export type WebsitePackage = typeof WEBSITE_PLANS[number]['id'];
export type WebsiteService = typeof WEBSITE_SERVICES[number];

export function isWebsiteServiceIncluded(plan: WebsitePackage, service: WebsiteService) {
  if (plan === 'maximum') return true;
  const position = WEBSITE_SERVICES.indexOf(service);
  return plan === 'free' ? position < 10 : position < 19 || service === 'mscore';
}

export function getWebsiteServiceKey(plan: WebsitePackage, service: WebsiteService) {
  if (plan === 'practical' && service === 'vehicleCatalog') return 'vehicleCatalogLimited';
  if (service === 'mscore' && plan !== 'free') return plan === 'practical' ? 'mscoreLimited' : 'mscoreFull';
  return service;
}

// Add overview.png, example-free.png, example-practical.png, example-maximum.png
// to client/public/imgs/websites (jpg, jpeg, webp and avif are also supported).
// Missing images render as white placeholders, without requesting nonexistent files.
const images = import.meta.glob<string>('/public/imgs/websites/{overview,example-free,example-practical,example-maximum}.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export function getWebsiteImage(name: string) {
  return Object.entries(images).find(([path]) => path.replace(/\.[^.]+$/, '').endsWith(`/${name}`))?.[1];
}
