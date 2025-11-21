"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalBlockchainSigner = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * Deterministic signer useful for local development and automated tests.
 * Not suitable for production traffic.
 */
class LocalBlockchainSigner {
    chainId;
    signerId;
    secret;
    constructor(options = {}) {
        this.chainId = options.chainId ?? 'verilens-local';
        this.signerId = options.signerId ?? 'local-signer';
        this.secret = options.secret ?? 'local-secret';
    }
    async getSupportedChainIds() {
        return [this.chainId];
    }
    async signPayload(payload) {
        const buffer = typeof payload === 'string'
            ? Buffer.from(payload)
            : payload instanceof Uint8Array
                ? Buffer.from(payload)
                : Buffer.from(payload);
        const hmac = node_crypto_1.default.createHmac('sha256', this.secret).update(buffer).digest('hex');
        return {
            signerId: this.signerId,
            chainId: this.chainId,
            signature: hmac,
            algorithm: 'HMAC-SHA256',
            payloadHash: node_crypto_1.default.createHash('sha256').update(buffer).digest('hex'),
            issuedAt: new Date(),
        };
    }
    async submitTransaction(signature, _options) {
        const txHash = node_crypto_1.default.createHash('sha1').update(signature.signature).digest('hex');
        return {
            txHash,
            chainId: signature.chainId,
            status: 'pending',
            metadata: {
                signerId: signature.signerId,
            },
        };
    }
    async getTransactionReceipt(txHash, _chainId) {
        return {
            txHash,
            chainId: this.chainId,
            status: 'confirmed',
            blockNumber: Math.floor(Date.now() / 1000),
        };
    }
}
exports.LocalBlockchainSigner = LocalBlockchainSigner;
exports.default = LocalBlockchainSigner;
