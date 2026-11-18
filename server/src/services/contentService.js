const cms = require('./cmsService');

async function fetchContent(options) {
  return (await cms.snapshot(options)).content;
}

module.exports = {
  fetchContent,
  snapshot: cms.snapshot,
};
