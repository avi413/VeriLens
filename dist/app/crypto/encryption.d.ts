export type EncryptedPayload = {
    iv: string;
    authTag: string;
    ciphertext: string;
};
export declare function encryptBuffer(buffer: Buffer, key: Buffer): EncryptedPayload;
export declare function decryptBuffer(payload: EncryptedPayload, key: Buffer): Buffer;
export declare function writeEncryptedFile(fileName: string, buffer: Buffer, key: Buffer): void;
