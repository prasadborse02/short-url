const urlService = require('../services/urlService');
const { generateUniqueShortCode } = require('../utils/codeGenerator');
const { logger } = require('../config/logger');
const { API_ENDPOINT, SHORT_CODE_LENGTH } = require('../constants/constants');

exports.createShortUrl = async (req, res) => {
    try {
        const { longUrl, requestCode } = req.body;
        if (requestCode) {
            if (requestCode.length > SHORT_CODE_LENGTH) {
                return res.status(400).json({ error: 'Requested code is too long' });
            }
            const exists = await urlService.getOriginalUrl(requestCode);
            if (exists) {
                return res.status(400).json({ error: 'Short code already exists' });
            }
        }

        const shortCode = requestCode || await generateUniqueShortCode();

        const result = await urlService.createShortUrl(longUrl, shortCode);
        const url = API_ENDPOINT + shortCode;

        res.json({
            url: url,
            originalUrl: longUrl
        });
    } catch (error) {
        logger.error('Error creating short URL:', error);
        res.status(500).json({ error: 'Error creating short URL' });
    }
};

exports.redirectToOriginal = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const originalUrl = await urlService.getOriginalUrl(shortCode);

        if (!originalUrl) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.redirect(originalUrl);
    } catch (error) {
        logger.error('Error redirecting:', error);
        res.status(500).json({ error: 'Error redirecting to original URL' });
    }
};
