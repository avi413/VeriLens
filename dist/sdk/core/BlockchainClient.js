"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainClient = void 0;
/**
 * Placeholder blockchain client that will eventually wrap chain-specific SDKs (EVM, Solana, etc.).
 */
class BlockchainClient {
    options;
    supportedChains;
    constructor(options = {}) {
        this.options = options;
        this.supportedChains = new Set(options.supportedChains ?? []);
    }
    async getSupportedChainIds() {
        // TODO: Fetch supported chains dynamically from configuration or remote service.
        return Array.from(this.supportedChains);
    }
    async signPayload(_payload, chainId) {
        // TODO: Integrate with hardware/software wallets or custodial signers.
        if (!this.supportedChains.has(chainId)) {
            throw new Error(`Chain ${chainId} is not supported yet.`);
        }
        throw new Error('signPayload is not implemented. TODO: wire in signing provider.');
    }
    async submitTransaction(_signature, _options) {
        // TODO: Relay signed payloads to blockchain RPC endpoints.
        throw new Error('submitTransaction is not implemented. TODO: add RPC transport.');
    }
    async getTransactionReceipt(_txHash, _chainId) {
        // TODO: Poll RPC layer for transaction confirmations.
        throw new Error('getTransactionReceipt is not implemented. TODO: add polling logic.');
    }
}
exports.BlockchainClient = BlockchainClient;
exports.default = BlockchainClient;
