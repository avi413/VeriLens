import IBlockchainSigner from '../interfaces/IBlockchainSigner';
import { SignatureResult, TransactionReceipt } from '../types';
export interface BlockchainClientOptions {
    supportedChains?: string[];
    defaultSignerId?: string;
}
/**
 * Placeholder blockchain client that will eventually wrap chain-specific SDKs (EVM, Solana, etc.).
 */
export declare class BlockchainClient implements IBlockchainSigner {
    private readonly options;
    private readonly supportedChains;
    constructor(options?: BlockchainClientOptions);
    getSupportedChainIds(): Promise<string[]>;
    signPayload(_payload: ArrayBuffer | Uint8Array | string, chainId: string): Promise<SignatureResult>;
    submitTransaction(_signature: SignatureResult, _options?: Record<string, unknown>): Promise<TransactionReceipt>;
    getTransactionReceipt(_txHash: string, _chainId: string): Promise<TransactionReceipt>;
}
export default BlockchainClient;
