"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecord = isRecord;
exports.assertNonEmptyString = assertNonEmptyString;
exports.validateSdkConfig = validateSdkConfig;
exports.assertValidSdkConfig = assertValidSdkConfig;
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function assertNonEmptyString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`${fieldName} must be a non-empty string.`);
    }
}
function validateSdkConfig(config) {
    const issues = [];
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
    if (config.blockchain &&
        (!isRecord(config.blockchain) ||
            typeof config.blockchain.defaultChainId !== 'string')) {
        issues.push({
            field: 'blockchain.defaultChainId',
            message: 'blockchain.defaultChainId must be provided when blockchain is configured.',
        });
    }
    return issues;
}
function assertValidSdkConfig(config) {
    const issues = validateSdkConfig(config);
    if (issues.length > 0) {
        throw new Error(`SDK configuration is invalid: ${issues
            .map((issue) => `${issue.field}: ${issue.message}`)
            .join('; ')}`);
    }
}
