/**
 * VeriLens SDK - Security Services Core
 * All security logic moved from webapp to SDK
 */
export interface IAntiTamperingService {
    verifyCodeIntegrity(): {
        passed: boolean;
        status: string;
    };
    detectDebugger(): boolean;
    startDOMMonitoring(): boolean;
    getTamperingStatus(): any;
}
export interface IDeviceSensorService {
    detectAvailableSensors(): any;
    startSensorCapture(duration: number): Promise<any>;
    generateDeviceSignature(): Promise<string>;
    getSensorStatus(): any;
}
export interface IHardwareAttestationService {
    checkWebAuthnSupport(): any;
    getDeviceCapabilities(): any;
    detectBiometricCapabilities(): Promise<any>;
    generateDeviceFingerprint(): Promise<string>;
}
export interface IBlockchainService {
    isConnected(): boolean;
    getBlockchainStats(): Promise<any>;
    submitImageHash(hash: string, verification: any, deviceId: string): Promise<any>;
    verifyImageHash(hash: string): Promise<any>;
}
export interface ISecureCameraAPI {
    startSecureCapture(videoElement: HTMLVideoElement, options?: any): Promise<any>;
    captureSecureImage(): Promise<any>;
    getSecurityStatus(): any;
    getEnabledSecurityFeatures(): any;
    stopSecureCapture(): void;
}
/**
 * Security Manager - Coordinates all security services
 */
export declare class SecurityManager {
    private services;
    constructor();
    private loadSecurityServices;
    initialize(): Promise<void>;
    getServices(): {
        antiTampering?: IAntiTamperingService;
        deviceSensor?: IDeviceSensorService;
        hardwareAttestation?: IHardwareAttestationService;
        blockchain?: IBlockchainService;
        secureCamera?: ISecureCameraAPI;
    };
    performSecurityCheck(): Promise<{
        passed: boolean;
        results: any[];
    }>;
    collectDeviceAttestation(): Promise<any>;
    calculateTrustScore(captureResult: any, deviceAttestation: any): number;
}
