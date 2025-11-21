import IBlockchainSigner from '../../interfaces/IBlockchainSigner';
import { SignatureResult, TransactionReceipt } from '../../types';
export interface LocalBlockchainSignerOptions {
    chainId?: string;
    signerId?: string;
    secret?: string;
}
/**
 * Deterministic signer useful for local development and automated tests.
 * Not suitable for production traffic.
 */
export declare class LocalBlockchainSigner implements IBlockchainSigner {
    private readonly chainId;
    private readonly signerId;
    private readonly secret;
    constructor(options?: LocalBlockchainSignerOptions);
    getSupportedChainIds(): Promise<string[]>;
    signPayload(payload: ArrayBuffer | Uint8Array | string): Promise<SignatureResult>;
    submitTransaction(signature: SignatureResult, _options?: Record<string, unknown>): Promise<TransactionReceipt>;
    getTransactionReceipt(txHash: string, _chainId: string): Promise<TransactionReceipt>;
}
export default LocalBlockchainSigner;
