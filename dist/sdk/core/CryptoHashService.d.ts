import ICryptoHasher from '../interfaces/ICryptoHasher';
import { HashAlgorithm, HashEncoding, HashResult } from '../types';
/**
 * Thin wrapper over Node/WebCrypto hashing with future support for pluggable engines.
 */
export declare class CryptoHashService implements ICryptoHasher {
    private readonly defaultAlgorithm;
    private readonly defaultEncoding;
    constructor(defaultAlgorithm?: HashAlgorithm, defaultEncoding?: HashEncoding);
    hashPayload(payload: ArrayBuffer | Uint8Array | string, algorithm?: HashAlgorithm): Promise<HashResult>;
    verifyHash(payload: ArrayBuffer | Uint8Array | string, expectedDigest: string, algorithm?: HashAlgorithm): Promise<boolean>;
    private normalizePayload;
}
export default CryptoHashService;
