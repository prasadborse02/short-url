const urlService = require('../services/urlService');
const { generateUniqueShortCode } = require('../utils/codeGenerator');
const logger = require('../config/logger');
const { API_ENDPOINT, SHORT_CODE_LENGTH } = require('../constants/constants');
const geoip = require('geoip-lite');
const countries = require('i18n-iso-countries');
const { v4: uuidv4 } = require('uuid');
const { isPreviewBot } = require('../utils/userAgentHelper');

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

        // Check if request is from a preview bot
        const userAgent = req.headers['user-agent'];
        if (isPreviewBot(userAgent)) {
            logger.debug(`Preview bot detected (${userAgent}), skipping click recording`);
            return res.redirect(originalUrl);
        }

        // Get accurate IP address
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                  req.headers['x-real-ip'] || 
                  req.connection.remoteAddress;

        // Get or set browser ID using cookies
        let ubid = req.cookies.ubid;
        if (!ubid) {
            ubid = uuidv4();
            res.cookie('ubid', ubid, { 
                maxAge: 24 * 60 * 60 * 1000, // 24 hour
                httpOnly: true 
            });
        }

        // Get country from IP
        const geo = geoip.lookup(ip);
        const countryCode = geo ? geo.country : 'Unknown';
        const countryName = countryCode !== 'Unknown' 
            ? countries.getName(countryCode, 'en') || countryCode 
            : 'Unknown';

        await urlService.recordClick(shortCode, ubid, ip, countryName);
        res.redirect(originalUrl);
    } catch (error) {
        logger.error(`Error redirecting: ${error}`);
        res.status(500).json({ error: 'Error redirecting to original URL' });
    }
};

exports.getUrlAnalytics = async (req, res) => {
    try {
        let jsonQuery;
        try {
            jsonQuery = JSON.parse(req.query.jsonQuery);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON query parameter' });
        }

        const { shortUrl } = jsonQuery;
        if (!shortUrl) {
            return res.status(400).json({ error: 'shortUrl is required in jsonQuery' });
        }
        
        const shortCode = shortUrl.split('/').pop();
        logger.debug(`Short code extracted from shortUrl: ${shortCode}`);

        const analytics = await urlService.getUrlAnalytics(shortCode);
        
        if (!analytics) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json(analytics);
    } catch (error) {
        logger.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Error fetching analytics' });
    }
};