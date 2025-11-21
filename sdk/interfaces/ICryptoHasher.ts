import { HashAlgorithm, HashResult } from '../types';

/**
 * Hashing abstraction to support multiple algorithms and output encodings.
 */
export interface ICryptoHasher {
  /**
   * Produce a digest from the provided payload.
   */
  hashPayload(
    payload: ArrayBuffer | Uint8Array | string,
    algorithm?: HashAlgorithm
  ): Promise<HashResult>;

  /**
   * Verify that a payload matches a reference digest value.
   */
  verifyHash(
    payload: ArrayBuffer | Uint8Array | string,
    expectedDigest: string,
    algorithm?: HashAlgorithm
  ): Promise<boolean>;
}

export default ICryptoHasher;
