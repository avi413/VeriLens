import { NormalizedError } from '../types';

/**
 * Convert unknown error shapes (strings, Error instances, primitives) into a structured format.
 */
export function normalizeError(
  error: unknown,
  details?: Record<string, unknown>
): NormalizedError {
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
    const record = error as Record<string, unknown>;
    return {
      name: (record.name as string) ?? 'Error',
      message: (record.message as string) ?? 'Unknown error',
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

export default normalizeError;
