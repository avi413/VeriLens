import crypto from 'node:crypto';
import ICryptoHasher from '../interfaces/ICryptoHasher';
import { HashAlgorithm, HashEncoding, HashResult } from '../types';

/**
 * Thin wrapper over Node/WebCrypto hashing with future support for pluggable engines.
 */
export class CryptoHashService implements ICryptoHasher {
  constructor(
    private readonly defaultAlgorithm: HashAlgorithm = 'sha256',
    private readonly defaultEncoding: HashEncoding = 'hex'
  ) {}

  async hashPayload(
    payload: ArrayBuffer | Uint8Array | string,
    algorithm: HashAlgorithm = this.defaultAlgorithm
  ): Promise<HashResult> {
    // TODO: Add browser-compatible implementation and streaming support.
    const buffer = this.normalizePayload(payload);
    const digest = crypto
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

  async verifyHash(
    payload: ArrayBuffer | Uint8Array | string,
    expectedDigest: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm
  ): Promise<boolean> {
    // TODO: Use constant-time comparison helpers once available.
    const result = await this.hashPayload(payload, algorithm);
    return result.digest === expectedDigest;
  }

  private normalizePayload(input: ArrayBuffer | Uint8Array | string): Buffer {
    if (typeof input === 'string') {
      return Buffer.from(input);
    }

    if (input instanceof Uint8Array) {
      return Buffer.from(input);
    }

    return Buffer.from(input);
  }
}

export default CryptoHashService;
