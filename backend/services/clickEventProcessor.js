const { kafkaConsumer } = require('../config/kafka');
const redisClient = require('../config/redis');
const Click = require('../models/click');
const logger = require('../config/logger');

async function updateRedisStats(shortCode, country, ubid) {
    try {
        await redisClient.incr(`clicks:${shortCode}`);
        await redisClient.hIncrBy('total_clicks_by_url', shortCode, 1);
        await redisClient.sAdd(`countries:${shortCode}`, country);        
        await redisClient.sAdd(`ubids:${shortCode}`, ubid);
    } catch (error) {
        logger.error(`Error updating Redis stats: ${error.message}`);
    }
}

async function storeClickData(clickEvent) {
    try {
        const click = await Click.create({
            short_code: clickEvent.short_code,
            ubid: clickEvent.ubid,
            ip_address: clickEvent.ip_address,
            country: clickEvent.country
        });
        
        logger.debug(`Stored new click data for ${clickEvent.short_code}`);
    } catch (error) {
        logger.error(`Error storing click data: ${error.message}, Short Code: ${clickEvent.short_code}`);
    }
}

async function startConsumer() {
    try {
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: false });
        
        await kafkaConsumer.run({
            autoCommit: true,
            eachMessage: async ({ message }) => {
                const clickEvent = JSON.parse(message.value.toString());
                logger.debug(`Processing click event for ${clickEvent.short_code}`);

                await updateRedisStats(
                    clickEvent.short_code,
                    clickEvent.country,
                    clickEvent.ubid
                );
                await storeClickData(clickEvent);
            }
        });
    } catch (error) {
        logger.error(`Error in Kafka consumer: ${error.message}`);
        // Attempt to reconnect after a delay
        setTimeout(() => startConsumer(), 3000);
    }
}

module.exports = { startConsumer };
