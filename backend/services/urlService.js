const URL = require('../models/url');
const redisClient = require('../config/redis');
const { logger } = require('../config/logger');
const { CACHE_EXPIRATION } = require('../constants/constants');
const { mysqlLogger, redisLogger } = require('../config/logger');
const { ERROR_CODES, ERROR_MESSAGES } = require('../constants/constants');

class UrlService {
    async createShortUrl(originalUrl, shortCode) {
        try {
            if (!originalUrl) {
                throw new Error(ERROR_MESSAGES.MISSING_URL);
            }

            // Check if code exists
            const existingUrl = await this.getOriginalUrl(shortCode);
            if (existingUrl) {
                throw new Error(ERROR_MESSAGES.CODE_EXISTS);
            }

            // Save to MySQL
            const url = await URL.create({
                original_url: originalUrl,
                short_code: shortCode
            });
            mysqlLogger.info(`Saved new URL mapping: ${shortCode} -> ${originalUrl}`);

            // Cache in Redis
            await redisClient.set(shortCode, originalUrl, {
                EX: CACHE_EXPIRATION
            });
            redisLogger.info(`Cached URL mapping: ${shortCode}`);

            return url;
        } catch (error) {
            mysqlLogger.error(`Error saving URL: ${error.message}`);
            throw error;
        }
    }

    async getOriginalUrl(shortCode) {
        try {
            // Try Redis first
            const cachedUrl = await redisClient.get(shortCode);
            if (cachedUrl) {
                redisLogger.info(`Cache hit for code: ${shortCode}`);
                return cachedUrl;
            }

            // If not in Redis, check MySQL
            const url = await URL.findOne({
                where: { short_code: shortCode }
            });

            if (!url) {
                mysqlLogger.warn(`URL not found for code: ${shortCode}`);
                return null;
            }

            const originalUrl = url.original_url;
            mysqlLogger.info(`Retrieved URL for code: ${shortCode}`);

            // Cache the result for next time
            await redisClient.set(shortCode, originalUrl, {
                EX: CACHE_EXPIRATION
            });
            redisLogger.info(`Cached URL for code: ${shortCode}`);

            return originalUrl;
        } catch (error) {
            mysqlLogger.error(`Error retrieving URL: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new UrlService();
