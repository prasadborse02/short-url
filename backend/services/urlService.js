const URL = require('../models/url');
const CLICK = require('../models/click');
const redisClient = require('../config/redis');
const logger = require('../config/logger');
const { CACHE_EXPIRATION } = require('../constants/constants');
const { ERROR_CODES, ERROR_MESSAGES } = require('../constants/constants');
const kafkaProducer = require('../config/kafka').kafkaProducer;

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
            logger.info(`Saved new URL mapping: ${shortCode} -> ${originalUrl}`);

            // Cache in Redis
            await redisClient.set(shortCode, originalUrl, {
                EX: CACHE_EXPIRATION
            });
            logger.info(`Cached URL mapping: ${shortCode}`);

            return url;
        } catch (error) {
            logger.error(`Error saving URL: ${error.message}`);
            throw error;
        }
    }

    async getOriginalUrl(shortCode) {
        try {
            // Try Redis first
            const cachedUrl = await redisClient.get(shortCode);
            if (cachedUrl) {
                logger.info(`Cache hit for code: ${shortCode}`);
                return cachedUrl;
            }

            // If not in Redis, check MySQL
            const url = await URL.findOne({
                where: { short_code: shortCode }
            });

            if (!url) {
                logger.info(`URL not found for code: ${shortCode}`);
                return null;
            }

            const originalUrl = url.original_url;
            logger.info(`Retrieved URL for code: ${shortCode}`);

            // Cache the result for next time
            await redisClient.set(shortCode, originalUrl, {
                EX: CACHE_EXPIRATION
            });
            logger.info(`Cached URL for code: ${shortCode}`);

            return originalUrl;
        } catch (error) {
            logger.error(`Error retrieving URL: ${error.message}`);
            throw error;
        }
    }

    async recordClick(shortCode, ubid, ipAddress, country) {
        try {
            const clickEvent = {
                short_code: shortCode,
                ubid: ubid,
                ip_address: ipAddress,
                country: country,
                timestamp: new Date().toISOString()
            };

            logger.info(`Click event: ${JSON.stringify(clickEvent)}`);

            // Attempt to send to Kafka with retries
            await kafkaProducer.send({
                topic: process.env.KAFKA_TOPIC,
                messages: [
                    { value: JSON.stringify(clickEvent) }
                ]
            });
            logger.info(`Recorded click for code: ${shortCode}`);
        } catch (error) {
            logger.error(`Error recording click: ${error.message}`);
        }
    }

    async getUrlAnalytics(shortCode) {
        try {
            const url = await URL.findOne({
                where: { short_code: shortCode },
                attributes: ['original_url', 'short_code', 'created_at']
            });

            if (!url) {
                return null;
            }

            // Get click count from database
            const clickCount = await CLICK.count({
                where: { short_code: shortCode }
            });

            return {
                originalUrl: url.original_url,
                shortCode: url.short_code,
                createdAt: url.created_at,
                totalClicks: clickCount
            };
        } catch (error) {
            logger.error(`Error fetching analytics: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new UrlService();
