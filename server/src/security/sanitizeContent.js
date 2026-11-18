const htmlPolicy = require('../../../shared/content-html.json');
let purifier;
async function getPurifier() {
  if (!purifier) {
    const { default: DOMPurify } = await import('isomorphic-dompurify');
    DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
      if (data.attrName === 'class') {
        data.attrValue = data.attrValue.split(/\s+/).filter(value => /^(?:faq-video-[\w-]+|ql-(?:align|indent|size|direction)-[\w-]+)$/.test(value)).join(' ');
        if (!data.attrValue) data.keepAttr = false;
      }
      if (data.attrName === 'target' && data.attrValue !== '_blank') data.keepAttr = false;
    });
    DOMPurify.addHook('afterSanitizeAttributes', node => {
      if (node.tagName === 'A' && node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer');
    });
    purifier = DOMPurify;
  }
  return purifier;
}
async function sanitizeContentHtml(content) {
  const DOMPurify = await getPurifier();
  const clean = html => DOMPurify.sanitize(String(html ?? ''), {
    ALLOWED_TAGS: htmlPolicy.tags, ALLOWED_ATTR: htmlPolicy.attributes,
    ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
  });
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const answers = collection => Array.isArray(collection) ? collection.map(item => {
    const cards = (item.cards || []).map(card => `<a class="faq-video-link" href="${escape(card.url)}" target="_blank" rel="noopener noreferrer"><span class="faq-video-brand">${escape(card.brand)}</span><strong>${escape(card.title)}</strong><span>${escape(card.caption)}</span><i>▶</i></a>`).join('');
    const answer = Object.hasOwn(item, 'answer') ? item.answer : `${item.intro ?? ''}${cards ? `<div class="faq-video-grid">${cards}</div>` : ''}`;
    return { ...item, ...(Object.hasOwn(item, 'intro') ? { intro: clean(item.intro) } : {}), answer: clean(answer) };
  }) : [];
  return Object.fromEntries(Object.entries(content).map(([language, localized]) => [language, {
    ...localized,
    FAQ: answers(localized.FAQ),
    videos: answers(localized.videos),
    ...(localized.privacy_policy !== undefined ? { privacy_policy: {
      ...localized.privacy_policy,
      sections: (localized.privacy_policy.sections || []).map(section => ({ ...section, html: clean(section.html) })),
    } } : {}),
  }]));
}
module.exports = sanitizeContentHtml;
