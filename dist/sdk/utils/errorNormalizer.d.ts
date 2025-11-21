import { NormalizedError } from '../types';
/**
 * Convert unknown error shapes (strings, Error instances, primitives) into a structured format.
 */
export declare function normalizeError(error: unknown, details?: Record<string, unknown>): NormalizedError;
export default normalizeError;
