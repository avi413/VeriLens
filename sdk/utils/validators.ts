import { SdkConfig, ValidationIssue } from '../types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertNonEmptyString(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }
}

export function validateSdkConfig(config: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(config)) {
    issues.push({
      field: 'root',
      message: 'Configuration must be an object.',
    });
    return issues;
  }

  if (typeof config.env !== 'string') {
    issues.push({
      field: 'env',
      message: 'env must be defined (e.g. development, staging, production).',
    });
  }

  if (typeof config.version !== 'string') {
    issues.push({
      field: 'version',
      message: 'version must be defined using semantic versioning.',
    });
  }

  if (
    config.blockchain &&
    (!isRecord(config.blockchain) ||
      typeof config.blockchain.defaultChainId !== 'string')
  ) {
    issues.push({
      field: 'blockchain.defaultChainId',
      message: 'blockchain.defaultChainId must be provided when blockchain is configured.',
    });
  }

  return issues;
}

export function assertValidSdkConfig(config: unknown): asserts config is SdkConfig {
  const issues = validateSdkConfig(config);
  if (issues.length > 0) {
    throw new Error(
      `SDK configuration is invalid: ${issues
        .map((issue) => `${issue.field}: ${issue.message}`)
        .join('; ')}`
    );
  }
}
