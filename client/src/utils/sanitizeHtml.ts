import DOMPurify from 'isomorphic-dompurify';
import htmlPolicy from '../../../shared/content-html.json';

DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName === 'class') {
    data.attrValue = data.attrValue.split(/\s+/).filter(value => /^(?:faq-video-[\w-]+|ql-(?:align|indent|size|direction)-[\w-]+)$/.test(value)).join(' ');
    if (!data.attrValue) data.keepAttr = false;
  }
  if (data.attrName === 'target' && data.attrValue !== '_blank') data.keepAttr = false;
});
DOMPurify.addHook('afterSanitizeAttributes', node => {
  const element = node as Element;
  if (element.nodeName === 'A' && element.getAttribute('target') === '_blank') element.setAttribute('rel', 'noopener noreferrer');
});

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: htmlPolicy.tags, ALLOWED_ATTR: htmlPolicy.attributes,
    ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
  });
}

export function sanitizeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
