import IBlockchainSigner from '../interfaces/IBlockchainSigner';
import { SignatureResult, TransactionReceipt } from '../types';

export interface BlockchainClientOptions {
  supportedChains?: string[];
  defaultSignerId?: string;
}

/**
 * Placeholder blockchain client that will eventually wrap chain-specific SDKs (EVM, Solana, etc.).
 */
export class BlockchainClient implements IBlockchainSigner {
  private readonly supportedChains: Set<string>;

  constructor(private readonly options: BlockchainClientOptions = {}) {
    this.supportedChains = new Set(options.supportedChains ?? []);
  }

  async getSupportedChainIds(): Promise<string[]> {
    // TODO: Fetch supported chains dynamically from configuration or remote service.
    return Array.from(this.supportedChains);
  }

  async signPayload(
    _payload: ArrayBuffer | Uint8Array | string,
    chainId: string
  ): Promise<SignatureResult> {
    // TODO: Integrate with hardware/software wallets or custodial signers.
    if (!this.supportedChains.has(chainId)) {
      throw new Error(`Chain ${chainId} is not supported yet.`);
    }

    throw new Error('signPayload is not implemented. TODO: wire in signing provider.');
  }

  async submitTransaction(
    _signature: SignatureResult,
    _options?: Record<string, unknown>
  ): Promise<TransactionReceipt> {
    // TODO: Relay signed payloads to blockchain RPC endpoints.
    throw new Error('submitTransaction is not implemented. TODO: add RPC transport.');
  }

  async getTransactionReceipt(
    _txHash: string,
    _chainId: string
  ): Promise<TransactionReceipt> {
    // TODO: Poll RPC layer for transaction confirmations.
    throw new Error('getTransactionReceipt is not implemented. TODO: add polling logic.');
  }
}

export default BlockchainClient;
