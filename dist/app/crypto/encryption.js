"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptBuffer = encryptBuffer;
exports.decryptBuffer = decryptBuffer;
exports.writeEncryptedFile = writeEncryptedFile;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const environment_1 = require("../../config/environment");
const logger_1 = require("../shared/logger");
const errors_1 = require("../shared/errors");
const config = (0, environment_1.loadConfig)();
const logger = (0, logger_1.getLogger)('crypto:encryption');
function encryptBuffer(buffer, key) {
    if (key.length !== 32) {
        throw new errors_1.AppError('Encryption key must be 32 bytes for AES-256-GCM', {
            code: 'CONFIGURATION_ERROR',
        });
    }
    const iv = crypto_1.default.randomBytes(config.encryption.ivLength);
    const cipher = crypto_1.default.createCipheriv(config.encryption.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        ciphertext: encrypted.toString('base64'),
    };
}
function decryptBuffer(payload, key) {
    const iv = Buffer.from(payload.iv, 'base64');
    const authTag = Buffer.from(payload.authTag, 'base64');
    const ciphertext = Buffer.from(payload.ciphertext, 'base64');
    const decipher = crypto_1.default.createDecipheriv(config.encryption.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
function writeEncryptedFile(fileName, buffer, key) {
    const encrypted = encryptBuffer(buffer, key);
    const payload = JSON.stringify(encrypted, null, 2);
    const dir = path_1.default.resolve(process.cwd(), config.storage.encryptedImageDir);
    fs_1.default.mkdirSync(dir, { recursive: true });
    const filePath = path_1.default.join(dir, `${fileName}.enc.json`);
    fs_1.default.writeFileSync(filePath, payload, { mode: 0o600 });
    logger.info('Encrypted image persisted', { filePath });
}
