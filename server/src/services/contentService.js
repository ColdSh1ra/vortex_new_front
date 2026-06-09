const contentModel = require('../models/contentModel');

async function fetchContent() {
  return contentModel.getContent();
}

async function updateContent(newContent) {
  return contentModel.saveContent(newContent);
}

module.exports = {
  fetchContent,
  updateContent,
};
