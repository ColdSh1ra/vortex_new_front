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

  return {
    ...content,
    FAQ: sanitizeAnswerCollection(DOMPurify, content.FAQ),
    videos: sanitizeAnswerCollection(DOMPurify, content.videos),
  };
}

module.exports = sanitizeContentHtml;
