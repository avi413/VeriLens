"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoHashService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * Thin wrapper over Node/WebCrypto hashing with future support for pluggable engines.
 */
class CryptoHashService {
    defaultAlgorithm;
    defaultEncoding;
    constructor(defaultAlgorithm = 'sha256', defaultEncoding = 'hex') {
        this.defaultAlgorithm = defaultAlgorithm;
        this.defaultEncoding = defaultEncoding;
    }
    async hashPayload(payload, algorithm = this.defaultAlgorithm) {
        // TODO: Add browser-compatible implementation and streaming support.
        const buffer = this.normalizePayload(payload);
        const digest = node_crypto_1.default
            .createHash(algorithm)
            .update(buffer)
            .digest(this.defaultEncoding);
        return {
            algorithm,
            digest,
            encoding: this.defaultEncoding,
            inputLength: buffer.length,
            issuedAt: new Date(),
        };
    }
    async verifyHash(payload, expectedDigest, algorithm = this.defaultAlgorithm) {
        // TODO: Use constant-time comparison helpers once available.
        const result = await this.hashPayload(payload, algorithm);
        return result.digest === expectedDigest;
    }
    normalizePayload(input) {
        if (typeof input === 'string') {
            return Buffer.from(input);
        }
        if (input instanceof Uint8Array) {
            return Buffer.from(input);
        }
        return Buffer.from(input);
    }
}
exports.CryptoHashService = CryptoHashService;
exports.default = CryptoHashService;
