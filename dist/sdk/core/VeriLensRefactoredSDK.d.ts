/**
 * VeriLens SDK - Refactored Clean Architecture
 * SDK uses SecurityManager, WebApp uses SDK
 */
export interface VeriLensConfig {
    security?: {
        enableAntiTampering?: boolean;
        enableHardwareAttestation?: boolean;
        enableSensorValidation?: boolean;
        enableBlockchainVerification?: boolean;
        securityLevel?: 'basic' | 'enhanced' | 'maximum';
    };
    blockchain?: {
        network?: 'ethereum' | 'polygon' | 'local';
        contractAddress?: string;
        fallbackToLocal?: boolean;
    };
    camera?: {
        quality?: number;
        frameValidation?: boolean;
        motionDetection?: boolean;
        liveProofRequired?: boolean;
    };
    device?: {
        sensorCapture?: boolean;
        biometricAuth?: boolean;
        deviceFingerprinting?: boolean;
    };
}
export interface CaptureResult {
    success: boolean;
    image?: {
        blob: Blob;
        dataUrl: string;
        hash: string;
        metadata: any;
    };
    verification?: {
        trustScore: number;
        securityLevel: string;
        sensorData?: any;
        liveProof?: any;
        deviceAttestation?: any;
    };
    blockchain?: {
        transactionHash: string;
        network: string;
        timestamp: string;
        verified: boolean;
    };
    security?: {
        tamperingDetected: boolean;
        integrityPassed: boolean;
        validationResults: any[];
    };
    error?: string;
}
export interface ImageVerificationResult {
    exists: boolean;
    verified: boolean;
    trustScore?: number;
    timestamp?: string;
    deviceId?: string;
    submitter?: string;
    network?: string;
    securityChecks?: {
        codeIntegrity: boolean;
        deviceValidation: boolean;
        sensorValidation: boolean;
    };
}
/**
 * VeriLens SDK - Clean Refactored Version
 * All security logic handled through SecurityManager
 */
export declare class VeriLensSDK {
    private config;
    private securityManager;
    private initialized;
    constructor(config?: VeriLensConfig);
    /**
     * Initialize the SDK
     */
    initialize(): Promise<void>;
    /**
     * Start secure camera
     */
    startCamera(videoElement: HTMLVideoElement, options?: any): Promise<void>;
    /**
     * Capture photo with full security validation
     */
    capturePhoto(): Promise<CaptureResult>;
    /**
     * Verify image hash
     */
    verifyImage(imageHash: string): Promise<ImageVerificationResult>;
    /**
     * Get SDK status
     */
    getStatus(): any;
    /**
     * Destroy SDK and cleanup
     */
    destroy(): Promise<void>;
    private ensureInitialized;
    private generateSecureHash;
    private submitToBlockchain;
}
export default VeriLensSDK;
