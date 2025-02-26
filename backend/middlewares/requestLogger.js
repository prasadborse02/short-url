const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    const logMessage = `${req.method} ${req.url}: ${JSON.stringify(req.body)}`;
    logger.info(logMessage);
    next();
};

module.exports = requestLogger;
