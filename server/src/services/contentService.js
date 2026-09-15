const contentModel = require('../models/contentModel');
const sanitizeContentHtml = require('../security/sanitizeContent');

async function fetchContent() {
  return sanitizeContentHtml(await contentModel.getContent());
}

async function updateContent(newContent) {
  const sanitizedContent = await sanitizeContentHtml(newContent);

  return contentModel.saveContent(sanitizedContent);
}

module.exports = {
  fetchContent,
  updateContent,
};
