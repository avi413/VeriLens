"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCaptureHandler = void 0;
const encryption_1 = require("../crypto/encryption");
const hash_1 = require("../crypto/hash");
const logger_1 = require("../shared/logger");
const errors_1 = require("../shared/errors");
const environment_1 = require("../../config/environment");
const config = (0, environment_1.loadConfig)();
const logger = (0, logger_1.getLogger)('mobile:image-capture');
async function defaultKeyProvider() {
    const envKey = process.env[config.encryption.keyEnvVar];
    if (!envKey) {
        throw new errors_1.AppError('Missing encryption key for captured images', {
            code: 'CONFIGURATION_ERROR'
        });
    }
    return Buffer.from(envKey, 'base64');
}
class ImageCaptureHandler {
    keyProvider;
    constructor(keyProvider = defaultKeyProvider) {
        this.keyProvider = keyProvider;
    }
    async handleCapture(request) {
        this.validateRequest(request);
        const key = await this.keyProvider();
        const checksum = (0, hash_1.sha256)(request.buffer);
        const fileName = `${request.deviceId}-${Date.now()}`;
        (0, encryption_1.writeEncryptedFile)(fileName, request.buffer, key);
        logger.info('Image captured and encrypted', { deviceId: request.deviceId, checksum });
        return {
            checksum,
            encryptedPath: `${config.storage.encryptedImageDir}/${fileName}.enc.json`,
            capturedAt: new Date().toISOString()
        };
    }
    validateRequest(request) {
        if (!request.deviceId) {
            throw new errors_1.AppError('Device identifier required', {
                code: 'VALIDATION_ERROR',
                statusCode: 400
            });
        }
        if (!request.buffer || request.buffer.length === 0) {
            throw new errors_1.AppError('Image buffer cannot be empty', {
                code: 'VALIDATION_ERROR',
                statusCode: 400
            });
        }
    }
}
exports.ImageCaptureHandler = ImageCaptureHandler;
