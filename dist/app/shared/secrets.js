"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecret = getSecret;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("./logger");
const errors_1 = require("./errors");
const logger = (0, logger_1.getLogger)('secrets');
const DEFAULT_SECRETS_PATH = path_1.default.resolve(process.cwd(), 'config', 'secrets.json');
function readSecretsFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        throw new errors_1.AppError(`Secrets file not found at ${filePath}`, {
            code: 'CONFIGURATION_ERROR'
        });
    }
    const buffer = fs_1.default.readFileSync(filePath);
    if (buffer.length === 0) {
        return {};
    }
    return JSON.parse(buffer.toString('utf-8'));
}
function decryptValue(value, key) {
    const data = Buffer.from(value, 'base64');
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const ciphertext = data.subarray(28);
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf-8');
}
function getSecret(key, options = {}) {
    const { path: secretsPath, decrypt, encryptionKeyEnv = 'SECRET_DECRYPTION_KEY' } = options;
    if (process.env[key]) {
        logger.debug(`Secret "${key}" served from env`, { source: 'env' });
        return process.env[key];
    }
    const resolvedPath = secretsPath ?? process.env.SECRETS_PATH ?? DEFAULT_SECRETS_PATH;
    const secrets = readSecretsFile(resolvedPath);
    if (!(key in secrets)) {
        throw new errors_1.AppError(`Secret ${key} not found`, { code: 'CONFIGURATION_ERROR' });
    }
    let value = secrets[key];
    if (decrypt) {
        const encryptionKey = process.env[encryptionKeyEnv];
        if (!encryptionKey) {
            throw new errors_1.AppError(`Missing encryption key env "${encryptionKeyEnv}"`, {
                code: 'CONFIGURATION_ERROR'
            });
        }
        value = decryptValue(value, Buffer.from(encryptionKey, 'base64'));
    }
    logger.debug(`Secret "${key}" served from file`, { source: 'file' });
    return value;
}
