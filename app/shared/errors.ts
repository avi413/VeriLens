import { Logger, getLogger } from './logger';

export type ErrorCode =
  | 'IMAGE_CAPTURE_FAILED'
  | 'METADATA_EXTRACTION_FAILED'
  | 'HASHING_FAILED'
  | 'BLOCKCHAIN_SIGNING_FAILED'
  | 'VERIFICATION_PIPELINE_FAILED'
  | 'CONFIGURATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN';

export interface ErrorContext {
  code?: ErrorCode;
  statusCode?: number;
  details?: Record<string, unknown>;
  cause?: Error;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(message: string, context: ErrorContext = {}) {
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

export function handleError(error: unknown, logger: Logger = getLogger('errors')): AppError {
  if (error instanceof AppError) {
    logger.error(error.message, { code: error.code, details: error.details });
    return error;
  }

  const wrapped = new AppError((error as Error)?.message ?? 'Unknown error', {
    code: 'UNKNOWN',
    statusCode: 500,
    details: { original: error }
  });

  logger.error(wrapped.message, { code: wrapped.code, details: wrapped.details });
  return wrapped;
}

export async function withErrorBoundary<T>(operation: () => Promise<T>, context: ErrorContext = {}) {
  try {
    return await operation();
  } catch (error) {
    throw new AppError((error as Error).message, { ...context, cause: error as Error });
  }
}
