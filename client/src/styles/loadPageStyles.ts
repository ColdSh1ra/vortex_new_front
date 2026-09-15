let mainStylesPromise: Promise<unknown> | null = null;
let faqStylesPromise: Promise<unknown> | null = null;
let contactStylesPromise: Promise<unknown> | null = null;
let trialRequestStylesPromise: Promise<unknown> | null = null;

function isFaqPath(pathname: string) {
  return pathname === '/faq' || pathname.startsWith('/faq/');
}

function isContactPath(pathname: string) {
  return pathname === '/contact' || pathname.startsWith('/contact/');
}

export function loadPageStyles(pathname: string) {
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
