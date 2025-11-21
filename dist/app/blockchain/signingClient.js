"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainSigningClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const retryQueue_1 = require("./retryQueue");
const hash_1 = require("../crypto/hash");
const secrets_1 = require("../shared/secrets");
const environment_1 = require("../../config/environment");
const logger_1 = require("../shared/logger");
const errors_1 = require("../shared/errors");
const config = (0, environment_1.loadConfig)();
const logger = (0, logger_1.getLogger)('blockchain:signing');
class BlockchainSigningClient {
    keySecretName;
    privateKey;
    queue;
    constructor(keySecretName = 'blockchainPrivateKey') {
        this.keySecretName = keySecretName;
        const secret = (0, secrets_1.getSecret)(keySecretName);
        this.privateKey = this.parseKey(secret);
        this.queue = new retryQueue_1.RetryQueue(async (job) => {
            const signature = await this.executeSigning(job.data);
            job.resolve(signature);
        }, config.blockchain.maxRetries, 500, (job, error) => job.reject(error));
    }
    async sign(payload) {
        const data = typeof payload === 'string' ? Buffer.from(payload) : payload;
        return new Promise((resolve, reject) => {
            this.queue.enqueue({ data, resolve, reject });
        });
    }
    parseKey(secret) {
        try {
            const pem = secret.includes('BEGIN') ? secret : Buffer.from(secret, 'base64').toString('utf-8');
            return crypto_1.default.createPrivateKey({
                key: pem,
                format: 'pem',
                type: 'pkcs8'
            });
        }
        catch (error) {
            throw new errors_1.AppError('Unable to load blockchain signing key', {
                code: 'CONFIGURATION_ERROR',
                cause: error
            });
        }
    }
    async executeSigning(data) {
        const digest = (0, hash_1.sha256)(data);
        try {
            const signer = crypto_1.default.createSign('SHA256');
            signer.update(Buffer.from(digest, 'hex'));
            signer.end();
            const signature = signer.sign(this.privateKey).toString('hex');
            logger.info('Payload signed', { digest });
            return signature;
        }
        catch (error) {
            logger.error('Signing failed', { message: error.message });
            throw new errors_1.AppError('Blockchain signing failed', {
                code: 'BLOCKCHAIN_SIGNING_FAILED',
                cause: error
            });
        }
    }
}
exports.BlockchainSigningClient = BlockchainSigningClient;
