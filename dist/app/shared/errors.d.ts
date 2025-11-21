import { Logger } from './logger';
export type ErrorCode = 'IMAGE_CAPTURE_FAILED' | 'METADATA_EXTRACTION_FAILED' | 'HASHING_FAILED' | 'BLOCKCHAIN_SIGNING_FAILED' | 'VERIFICATION_PIPELINE_FAILED' | 'CONFIGURATION_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN';
export interface ErrorContext {
    code?: ErrorCode;
    statusCode?: number;
    details?: Record<string, unknown>;
    cause?: Error;
}
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly details?: Record<string, unknown>;
    constructor(message: string, context?: ErrorContext);
    toJSON(): {
        message: string;
        code: ErrorCode;
        statusCode: number;
        details: Record<string, unknown> | undefined;
    };
}
export declare function handleError(error: unknown, logger?: Logger): AppError;
export declare function withErrorBoundary<T>(operation: () => Promise<T>, context?: ErrorContext): Promise<T>;
