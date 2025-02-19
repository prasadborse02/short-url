const pino = require('pino');

const logger = pino({
    level: 'trace',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname,context',
            messageFormat: '{context}: {msg} {data}',
            customLevels: {
                error: 50,
                warn: 40,
                info: 30,
                debug: 20,
                trace: 10
            }
        }
    }
});

// Optional: Create child loggers for different contexts
const httpLogger = logger.child({ context: 'http' });
const redisLogger = logger.child({ context: 'redis' });
const mysqlLogger = logger.child({ context: 'mysql' });

module.exports = {
    logger,
    httpLogger,
    redisLogger,
    mysqlLogger
};
