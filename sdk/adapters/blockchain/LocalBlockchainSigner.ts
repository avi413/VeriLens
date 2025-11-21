import crypto from 'node:crypto';
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
export class LocalBlockchainSigner implements IBlockchainSigner {
  private readonly chainId: string;
  private readonly signerId: string;
  private readonly secret: string;

  constructor(options: LocalBlockchainSignerOptions = {}) {
    this.chainId = options.chainId ?? 'verilens-local';
    this.signerId = options.signerId ?? 'local-signer';
    this.secret = options.secret ?? 'local-secret';
  }

  async getSupportedChainIds(): Promise<string[]> {
    return [this.chainId];
  }

  async signPayload(
    payload: ArrayBuffer | Uint8Array | string
  ): Promise<SignatureResult> {
    const buffer =
      typeof payload === 'string'
        ? Buffer.from(payload)
        : payload instanceof Uint8Array
        ? Buffer.from(payload)
        : Buffer.from(payload);

    const hmac = crypto.createHmac('sha256', this.secret).update(buffer).digest('hex');
    return {
      signerId: this.signerId,
      chainId: this.chainId,
      signature: hmac,
      algorithm: 'HMAC-SHA256',
      payloadHash: crypto.createHash('sha256').update(buffer).digest('hex'),
      issuedAt: new Date(),
    };
  }

  async submitTransaction(
    signature: SignatureResult,
    _options?: Record<string, unknown>
  ): Promise<TransactionReceipt> {
    const txHash = crypto.createHash('sha1').update(signature.signature).digest('hex');
    return {
      txHash,
      chainId: signature.chainId,
      status: 'pending',
      metadata: {
        signerId: signature.signerId,
      },
    };
  }

  async getTransactionReceipt(
    txHash: string,
    _chainId: string
  ): Promise<TransactionReceipt> {
    return {
      txHash,
      chainId: this.chainId,
      status: 'confirmed',
      blockNumber: Math.floor(Date.now() / 1000),
    };
  }
}

export default LocalBlockchainSigner;
