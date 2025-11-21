import { SignatureResult, TransactionReceipt } from '../types';

/**
 * Interface for signing and submitting payloads to supported blockchain networks.
 */
export interface IBlockchainSigner {
  /**
   * Retrieve the set of chain IDs the signer can operate on.
   */
  getSupportedChainIds(): Promise<string[]>;

  /**
   * Apply the signer credentials to a payload and return the signature artifact.
   */
  signPayload(
    payload: ArrayBuffer | Uint8Array | string,
    chainId: string
  ): Promise<SignatureResult>;

  /**
   * Submit the signed payload to the network and return a receipt placeholder.
   */
  submitTransaction(
    signature: SignatureResult,
    options?: Record<string, unknown>
  ): Promise<TransactionReceipt>;

  /**
   * Poll the blockchain for an updated receipt.
   */
  getTransactionReceipt(
    txHash: string,
    chainId: string
  ): Promise<TransactionReceipt>;
}

export default IBlockchainSigner;
