class CustomError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends CustomError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class ValidationError extends CustomError {
    constructor(message = 'Invalid input') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

module.exports = {
    CustomError,
    NotFoundError,
    ValidationError
};
