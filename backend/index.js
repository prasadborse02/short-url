require('dotenv').config();
const express = require('express');
const redisClient = require('./config/redis');
const requestLogger = require('./middlewares/requestLogger');
const urlRoutes = require('./routes/urlRoutes');
const { logger } = require('./config/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

// Connect to Redis
(async () => {
    await redisClient.connect();
})();

// Routes
app.use('/', urlRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: '404 Not Found' });
});

// Start the server
app.listen(port, () => {
    logger.info(`🚀 Server running at http://localhost:${port}`);
});
