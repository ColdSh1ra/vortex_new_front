const HTML_SANITIZE_CONFIG = {
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

let domPurifyPromise;

async function getDomPurify() {
  domPurifyPromise ??= import('isomorphic-dompurify')
    .then(({ default: DOMPurify }) => DOMPurify);

  return domPurifyPromise;
}

function sanitizeAnswerCollection(DOMPurify, collection) {
  if (!Array.isArray(collection)) {
    return [];
  }

  return collection.map((item) => ({
    ...item,
    answer: DOMPurify.sanitize(String(item.answer ?? ''), HTML_SANITIZE_CONFIG),
  }));
}

async function sanitizeContentHtml(content) {
  const DOMPurify = await getDomPurify();
  return Object.fromEntries(Object.entries(content).map(([language, localized]) => [
    language,
    {
      ...localized,
      FAQ: sanitizeAnswerCollection(DOMPurify, localized.FAQ),
      videos: sanitizeAnswerCollection(DOMPurify, localized.videos),
    },
  ]));
}

module.exports = sanitizeContentHtml;
