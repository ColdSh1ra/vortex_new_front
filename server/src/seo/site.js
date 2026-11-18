const site = require('../../../shared/site.json');

function languageFromSearch(search) {
  const value = new URLSearchParams(search).get('lang');
  return Object.hasOwn(site.languageCodes, value) ? value : 'ua';
}

function localizedUrl(path, language = 'ua') {
  const url = new URL(path, site.origin);
  url.hash = '';
  if (language === 'ua') url.searchParams.delete('lang');
  else url.searchParams.set('lang', language);
  return url.href;
}

function canonicalRequest(requestUrl) {
  const url = new URL(requestUrl, site.origin);
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  const knownPath = [...site.staticPaths, '/blog'].find(path => path.toLowerCase() === url.pathname.toLowerCase());
  if (knownPath) url.pathname = knownPath;
  const language = languageFromSearch(url.search);
  // Only content-bearing parameters belong in an indexable URL.
  const params = new URLSearchParams();
  if (url.pathname === '/blog') {
    const page = url.searchParams.get('page');
    if (page && /^[1-9]\d{0,5}$/.test(page) && Number(page) > 1) params.set('page', String(Number(page)));
    else if (page && !/^[1-9]\d{0,5}$/.test(page)) params.set('page', page); // Preserve invalid pages for a real 404.
  }
  if (language !== 'ua') params.set('lang', language);
  url.search = params.toString();
  return url.pathname + url.search;
}

module.exports = { ...site, languageFromSearch, localizedUrl, canonicalRequest };
