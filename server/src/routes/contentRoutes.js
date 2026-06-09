const express = require('express');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/content', contentController.getContent);
router.post('/content', contentController.postContent);

module.exports = router;
