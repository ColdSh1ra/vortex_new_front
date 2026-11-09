let mainStylesPromise: Promise<unknown> | null = null;
let faqStylesPromise: Promise<unknown> | null = null;
let contactStylesPromise: Promise<unknown> | null = null;
let trialRequestStylesPromise: Promise<unknown> | null = null;
let carServiceStylesPromise: Promise<unknown> | null = null;
let websitesStylesPromise: Promise<unknown> | null = null;
let dismantlingStylesPromise: Promise<unknown> | null = null;
let tecdocStylesPromise: Promise<unknown> | null = null;
let blogStylesPromise: Promise<unknown> | null = null;

function isFaqPath(pathname: string) {
  return pathname === '/faq' || pathname.startsWith('/faq/');
}

function isContactPath(pathname: string) {
  return pathname === '/contact' || pathname.startsWith('/contact/');
}

export function loadPageStyles(pathname: string) {
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
    mainStylesPromise ??= import('./main.css');
    trialRequestStylesPromise ??= import('./trial-request.css');
    carServiceStylesPromise ??= import('./car-service.css');
    return Promise.all([mainStylesPromise, trialRequestStylesPromise, carServiceStylesPromise]);
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
  trialRequestStylesPromise ??= import('./trial-request.css');
  return Promise.all([mainStylesPromise, trialRequestStylesPromise]);
}
