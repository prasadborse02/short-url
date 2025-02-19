const { nanoid } = require('nanoid');
const redisClient = require('../config/redis');
const { logger } = require('../config/logger');
const { ERROR_CODES, ERROR_MESSAGES } = require('../constants/constants');

const generateShortCode = () => {
    return nanoid(process.env.URL_LENGTH);
};

const shortenUrl = async (req, res) => {
    const { longUrl, requestCode } = req.body;

    if (!longUrl) {
        return res.status(400).json({ 
            error: ERROR_CODES.MISSING_URL, 
            message: ERROR_MESSAGES.MISSING_URL 
        });
    }
    
    try {
        let shortCode = requestCode;
        if (requestCode) {
            const existingUrl = await redisClient.get(requestCode);
            if (existingUrl) {
                return res.status(400).json({ 
                    error: ERROR_CODES.CODE_EXISTS, 
                    message: ERROR_MESSAGES.CODE_EXISTS 
                });
            }
        } else {
            shortCode = generateShortCode();
        }

        await redisClient.set(shortCode, longUrl);
        res.json({ shortUrl: `http://localhost:${process.env.PORT}/${shortCode}` });
    } catch (err) {
        logger.error('Redis error:', err);
        res.status(500).json({ 
            error: ERROR_CODES.REDIS_ERROR, 
            message: ERROR_MESSAGES.REDIS_ERROR 
        });
    }
};

const redirectUrl = async (req, res) => {
    const { shortCode } = req.params;

    try {
        const longUrl = await redisClient.get(shortCode);
        if (longUrl) {
            res.redirect(301, longUrl);
        } else {
            res.status(404).json({ 
                error: ERROR_CODES.NOT_FOUND, 
                message: ERROR_MESSAGES.NOT_FOUND 
            });
        }
    } catch (err) {
        logger.error('Redis error:', err);
        res.status(500).json({ 
            error: ERROR_CODES.REDIS_ERROR, 
            message: ERROR_MESSAGES.REDIS_ERROR 
        });
    }
};

module.exports = {
    shortenUrl,
    redirectUrl
};
