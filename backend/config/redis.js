const redis = require('redis');
const logger = require('./logger');

const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('error', (err) => {
    logger.error(err, 'Redis error');
});

module.exports = redisClient;
