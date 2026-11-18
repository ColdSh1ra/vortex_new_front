const express = require('express');
const controller = require('../controllers/contentController');
const router = express.Router();
router.get('/content', controller.getContent);
router.get('/content/media', controller.getMedia);
router.post('/content/preview/end', controller.endPreview);
router.all(['/content', '/content/media'], (req, res) => res.status(405).set('Allow', 'GET, HEAD').json({ code: 'METHOD_NOT_ALLOWED' }));
module.exports = router;
