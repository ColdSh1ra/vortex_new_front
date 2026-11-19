let mainStylesPromise: Promise<unknown> | null = null;
let faqStylesPromise: Promise<unknown> | null = null;
let contactStylesPromise: Promise<unknown> | null = null;
let trialRequestStylesPromise: Promise<unknown> | null = null;
let carServiceStylesPromise: Promise<unknown> | null = null;
let websitesStylesPromise: Promise<unknown> | null = null;
let dismantlingStylesPromise: Promise<unknown> | null = null;
let tecdocStylesPromise: Promise<unknown> | null = null;
let blogStylesPromise: Promise<unknown> | null = null;
let integrationStylesPromise: Promise<unknown> | null = null;
let privacyStylesPromise: Promise<unknown> | null = null;
let pricingStylesPromise: Promise<unknown> | null = null;
let vortexPlansStylesPromise: Promise<unknown> | null = null;

function isFaqPath(pathname: string) {
  return pathname === '/faq' || pathname.startsWith('/faq/');
}

function isContactPath(pathname: string) {
  return pathname === '/contact' || pathname.startsWith('/contact/');
}

function importPageStyles(pathname: string): Promise<unknown> {
  if (pathname === '/privacy-policy' || pathname === '/privacy-policy/') {
    privacyStylesPromise ??= import('./privacy.css');
    return privacyStylesPromise;
  }
  if (pathname.startsWith('/integrations/')) {
    integrationStylesPromise ??= import('./integrations.css');
    return integrationStylesPromise;
  }
  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    blogStylesPromise ??= import('./blog.css');
    return blogStylesPromise;
  }
  if (pathname === '/tecdoc-license' || pathname.startsWith('/tecdoc-license/')) {
    tecdocStylesPromise ??= import('./tecdoc.css');
    trialRequestStylesPromise ??= import('./trial-request.css');
    return Promise.all([tecdocStylesPromise, trialRequestStylesPromise]);
  }
  if (pathname === '/auto-dismantling' || pathname.startsWith('/auto-dismantling/')) {
    dismantlingStylesPromise ??= import('./auto-dismantling.css');
    trialRequestStylesPromise ??= import('./trial-request.css');
    return Promise.all([dismantlingStylesPromise, trialRequestStylesPromise]);
  }
  if (pathname === '/websites' || pathname.startsWith('/websites/')) {
    websitesStylesPromise ??= import('./websites.css');
    trialRequestStylesPromise ??= import('./trial-request.css');
    return Promise.all([websitesStylesPromise, trialRequestStylesPromise]);
  }
  if (pathname === '/car-service' || pathname.startsWith('/car-service/')) {
    pricingStylesPromise ??= import('./pricing-calculator.css');
    trialRequestStylesPromise ??= import('./trial-request.css');
    carServiceStylesPromise ??= import('./car-service.css');
    return Promise.all([pricingStylesPromise, trialRequestStylesPromise, carServiceStylesPromise]);
  }
  if (isFaqPath(pathname)) {
    faqStylesPromise ??= import('./faq.css');
    return faqStylesPromise;
  }

  if (isContactPath(pathname)) {
    contactStylesPromise ??= import('./contact.css');
    trialRequestStylesPromise ??= import('./trial-request.css');
    return Promise.all([contactStylesPromise, trialRequestStylesPromise]);
  }

  mainStylesPromise ??= import('./main.css');
  vortexPlansStylesPromise ??= import('./vortex-plans.css');
  pricingStylesPromise ??= import('./pricing-calculator.css');
  trialRequestStylesPromise ??= import('./trial-request.css');
  return Promise.all([mainStylesPromise, vortexPlansStylesPromise, pricingStylesPromise, trialRequestStylesPromise]);
}

// Paths whose styles have finished loading (or failed: the page is shown anyway).
const readyPaths = new Set<string>();

/** True once every stylesheet the path needs is applied; the server always has them inlined. */
export function arePageStylesReady(pathname: string) {
  return typeof window === 'undefined' || readyPaths.has(pathname);
}

export function loadPageStyles(pathname: string) {
  const styles = importPageStyles(pathname);
  styles.then(() => readyPaths.add(pathname), () => readyPaths.add(pathname));
  return styles;
}
