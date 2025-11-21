import { SdkConfig, ValidationIssue } from '../types';
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string;
export declare function validateSdkConfig(config: unknown): ValidationIssue[];
export declare function assertValidSdkConfig(config: unknown): asserts config is SdkConfig;
