const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/shorten', urlController.createShortUrl);
router.get('/l/:shortCode', urlController.redirectToOriginal);
router.get('/analytics', urlController.getUrlAnalytics);
router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

module.exports = router;
