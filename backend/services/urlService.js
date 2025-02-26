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
                attributes: ['original_url', 'created_at']
            });

            if (!url) {
                return null;
            }

            // Get all clicks for analysis
            const clicks = await CLICK.findAll({
                where: { short_code: shortCode },
                attributes: ['clicked_at', 'ubid', 'ip_address', 'country']
            });

            // Calculate sessions (unique combination of ubid and date)
            const sessions = new Set();
            const dateClicks = new Set();
            const hourlyClicks = Array(24).fill(0);
            const countryStats = {};
            const userVisits = {};

            clicks.forEach(click => {
                const date = new Date(click.clicked_at);
                const dateStr = date.toISOString().split('T')[0];
                const sessionKey = `${click.ubid}_${dateStr}`;
                
                // Count sessions
                sessions.add(sessionKey);
                
                // Count unique dates
                dateClicks.add(dateStr);
                
                // Count hourly clicks
                const hour = date.getHours();
                hourlyClicks[hour]++;
                
                // Count by country
                countryStats[click.country] = (countryStats[click.country] || 0) + 1;
                
                // Track user visits
                if (!userVisits[click.ubid]) {
                    userVisits[click.ubid] = new Set();
                }
                userVisits[click.ubid].add(dateStr);
            });

            // Calculate repeat visitors (users who visited on multiple days)
            const repeatVisitors = Object.values(userVisits).filter(dates => dates.size > 1).length;

            // Calculate average sessions per day
            const activeDays = dateClicks.size;
            const avgSessionsPerDay = activeDays > 0 ? sessions.size / activeDays : 0;

            return {
                originalUrl: url.original_url,
                createdAt: url.created_at,
                analytics: {
                    totalSessions: sessions.size,
                    activeDays: activeDays,
                    avgSessionsPerDay: parseFloat(avgSessionsPerDay.toFixed(2)),
                    geographicDistribution: countryStats,
                    timeOfDayTrends: hourlyClicks,
                    repeatVisitors: repeatVisitors,
                    engagementPatterns: {
                        totalClicks: clicks.length,
                        uniqueSessions: sessions.size,
                        clicksPerSession: parseFloat((clicks.length / sessions.size).toFixed(2))
                    }
                }
            };
        } catch (error) {
            logger.error(`Error fetching analytics: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new UrlService();
