const contentService = require('../services/contentService');

async function getContent(req, res) {
  try {
    const data = await contentService.fetchContent();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error reading data file' });
  }
}

async function postContent(req, res) {
  try {
    const savedData = await contentService.updateContent(req.body);
    res.status(200).json({
      message: 'Content updated successfully!',
      data: savedData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error writing to data file' });
  }
}

module.exports = {
  getContent,
  postContent,
};
