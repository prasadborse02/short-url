const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp, data }) => {
    return `${timestamp} ${level}: ${message} ${data ? JSON.stringify(data) : ''}`;
});

const logger = createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        trace: 4
    },
    level: 'trace',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(),
        customFormat
    ),
    transports: [
        new transports.Console()
    ]
});

module.exports = logger;
