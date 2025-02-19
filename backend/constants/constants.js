module.exports = {
    ERROR_CODES: {
        MISSING_URL: 'MISSING_URL',
        CODE_EXISTS: 'CODE_EXISTS',
        NOT_FOUND: 'NOT_FOUND',
        REDIS_ERROR: 'REDIS_ERROR'
    },
    ERROR_MESSAGES: {
        MISSING_URL: 'Missing longUrl parameter',
        CODE_EXISTS: 'Short code already exists',
        NOT_FOUND: 'Short URL not found',
        REDIS_ERROR: 'Redis operation failed'
    }
};
