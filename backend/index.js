require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { kafkaProducer, kafkaConsumer } = require('./config/kafka');
const sequelize = require('./config/mysql');
const redisClient = require('./config/redis');
const requestLogger = require('./middlewares/requestLogger');
const urlRoutes = require('./routes/urlRoutes');
const logger = require('./config/logger');
const { startConsumer } = require('./services/clickEventProcessor');

const app = express();
const port = process.env.PORT;
const HOST = process.env.HOST;

app.use(express.json());
app.use(requestLogger);
app.use(cookieParser());
app.use(cors());

const connectServices = async () => {
    // Connect to MySQL first
    try {
        await sequelize.authenticate();
        logger.debug('✅ Database connected');
    } catch (error) {
        logger.error('❌ Error connecting to the database:', error);
        process.exit(1);
    }

    // Connect to Redis
    try {
        await redisClient.connect();
        logger.debug('✅ Connected to Redis');
    } catch (error) {
        logger.error(`Error connecting to Redis: ${error}`);
        process.exit(1);
    }

    // Connect to Kafka
    try {
        await kafkaProducer.connect();
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe({ topic: process.env.KAFKA_TOPIC });
        await startConsumer();
        logger.debug('✅ Connected to Kafka producer and consumer');
    } catch (error) {
        logger.error(`Error connecting to Kafka: ${error}`);
        process.exit(1);
    }
};

// Start server only after connecting to services
const startServer = async () => {
    try {
        await connectServices();
        app.listen(port, HOST, () => {
            logger.debug(`🚀 Server running on http://${HOST}:${port}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Routes
app.use('/', urlRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: '404 Not Found' });
});

startServer();
