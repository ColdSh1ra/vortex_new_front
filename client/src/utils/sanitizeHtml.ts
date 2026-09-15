import DOMPurify, { type Config } from 'isomorphic-dompurify';

const HTML_SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    'a',
    'b',
    'br',
    'div',
    'em',
    'i',
    'li',
    'ol',
    'p',
    'span',
    'strong',
    'ul',
  ],
  ALLOWED_ATTR: [
    'aria-hidden',
    'class',
    'href',
    'rel',
    'target',
    'title',
  ],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: true,
};

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, HTML_SANITIZE_CONFIG);
}

export function sanitizeJsonLd(value: unknown) {
  const serializedValue = JSON.stringify(value).replace(/</g, '\\u003c');

  return DOMPurify.sanitize(serializedValue, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
