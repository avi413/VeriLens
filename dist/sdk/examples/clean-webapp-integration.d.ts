/**
 * VeriLens WebApp Integration - Clean Architecture Example
 *
 * This shows how the webapp should properly consume the VeriLens SDK.
 * The SDK now contains all the core logic, the webapp is just a thin UI layer.
 */
/**
 * VeriLens WebApp - Clean Implementation Using SDK
 *
 * This webapp is now a simple consumer of the VeriLens SDK.
 * All security, blockchain, and verification logic is handled by the SDK.
 */
declare class VeriLensWebApp {
    private sdk;
    private videoElement?;
    private statusElement?;
    constructor(config?: {});
    /**
     * Initialize the WebApp and SDK
     */
    initialize(): Promise<void>;
    /**
     * Start camera (simple wrapper around SDK)
     */
    startCamera(): Promise<void>;
    /**
     * Capture photo (simple wrapper around SDK)
     */
    capturePhoto(): Promise<void>;
    /**
     * Verify image hash (simple wrapper around SDK)
     */
    verifyImage(hash: string): Promise<void>;
    /**
     * Get system status (simple wrapper around SDK)
     */
    getStatus(): any;
    /**
     * Shutdown (simple wrapper around SDK)
     */
    destroy(): Promise<void>;
    private updateStatus;
    private displayCaptureResult;
    private displayVerificationResult;
}
export { VeriLensWebApp };
export default VeriLensWebApp;
