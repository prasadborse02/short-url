const { Kafka, Partitioners } = require('kafkajs');
const logger = require('./logger');

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: [process.env.KAFKA_BROKER],
    retry: {
        initialRetryTime: 100,
        retries: 8,
        maxRetryTime: 30000,
        factor: 2
    },
});

const kafkaProducer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});
const kafkaConsumer = kafka.consumer({ 
    groupId: process.env.KAFKA_GROUP_ID || 'url-shortener-group',  // Ensure group ID is set
    retry: {
        initialRetryTime: 1000,
        retries: 8
    }
});

kafkaConsumer.on('consumer.crash', async (error) => {
    logger.error('Kafka consumer crashed:', error);
    try {
        await kafkaConsumer.disconnect();
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe({ topic: 'click-events', fromBeginning: false });
    } catch (e) {
        logger.error('Failed to recover consumer:', e);
    }
});

kafkaProducer.on('producer.disconnect', () => {
    logger.error('Producer disconnected');
});

kafkaConsumer.on('consumer.disconnect', () => {
    logger.error('Consumer disconnected');
});

module.exports = {
    kafkaProducer,
    kafkaConsumer
};