"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeError = normalizeError;
/**
 * Convert unknown error shapes (strings, Error instances, primitives) into a structured format.
 */
function normalizeError(error, details) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(details ? { details } : {}),
        };
    }
    if (typeof error === 'string') {
        return {
            name: 'Error',
            message: error,
            ...(details ? { details } : {}),
        };
    }
    if (typeof error === 'object' && error !== null) {
        const record = error;
        return {
            name: record.name ?? 'Error',
            message: record.message ?? 'Unknown error',
            details: {
                ...record,
                ...details,
            },
        };
    }
    return {
        name: 'Error',
        message: String(error),
        ...(details ? { details } : {}),
    };
}
exports.default = normalizeError;
