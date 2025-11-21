"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.handleError = handleError;
exports.withErrorBoundary = withErrorBoundary;
const logger_1 = require("./logger");
class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(message, context = {}) {
        super(message);
        this.code = context.code ?? 'UNKNOWN';
        this.statusCode = context.statusCode ?? 500;
        this.details = context.details;
        if (context.cause) {
            this.cause = context.cause;
        }
    }
    toJSON() {
        return {
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details
        };
    }
}
exports.AppError = AppError;
function handleError(error, logger = (0, logger_1.getLogger)('errors')) {
    if (error instanceof AppError) {
        logger.error(error.message, { code: error.code, details: error.details });
        return error;
    }
    const wrapped = new AppError(error?.message ?? 'Unknown error', {
        code: 'UNKNOWN',
        statusCode: 500,
        details: { original: error }
    });
    logger.error(wrapped.message, { code: wrapped.code, details: wrapped.details });
    return wrapped;
}
async function withErrorBoundary(operation, context = {}) {
    try {
        return await operation();
    }
    catch (error) {
        throw new AppError(error.message, { ...context, cause: error });
    }
}
