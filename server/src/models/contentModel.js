const fs = require('fs').promises;
const { VORTEX_DATA_PATH } = require('../config/constants');

async function getContent() {
  const rawData = await fs.readFile(VORTEX_DATA_PATH, 'utf8');
  return JSON.parse(rawData);
}

async function saveContent(content) {
  await fs.writeFile(VORTEX_DATA_PATH, JSON.stringify(content, null, 2));
  return content;
}

module.exports = {
  getContent,
  saveContent,
};
