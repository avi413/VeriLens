export type CaptureRequest = {
    deviceId: string;
    format: 'jpeg' | 'png' | 'heic';
    buffer: Buffer;
    metadata?: Record<string, unknown>;
};
export type CaptureResponse = {
    checksum: string;
    encryptedPath: string;
    capturedAt: string;
};
type EncryptionKeyProvider = () => Promise<Buffer>;
export declare class ImageCaptureHandler {
    private readonly keyProvider;
    constructor(keyProvider?: EncryptionKeyProvider);
    handleCapture(request: CaptureRequest): Promise<CaptureResponse>;
    private validateRequest;
}
export {};
