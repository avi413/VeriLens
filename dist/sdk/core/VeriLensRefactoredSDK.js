"use strict";
/**
 * VeriLens SDK - Refactored Clean Architecture
 * SDK uses SecurityManager, WebApp uses SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriLensSDK = void 0;
const SecurityManager_1 = require("./SecurityManager");
/**
 * VeriLens SDK - Clean Refactored Version
 * All security logic handled through SecurityManager
 */
class VeriLensSDK {
    config;
    securityManager;
    initialized = false;
    constructor(config = {}) {
        this.config = {
            security: {
                enableAntiTampering: true,
                enableHardwareAttestation: true,
                enableSensorValidation: true,
                enableBlockchainVerification: true,
                securityLevel: 'maximum',
                ...config.security,
            },
            blockchain: {
                network: 'polygon',
                fallbackToLocal: true,
                ...config.blockchain,
            },
            camera: {
                quality: 0.98,
                frameValidation: true,
                motionDetection: true,
                liveProofRequired: true,
                ...config.camera,
            },
            device: {
                sensorCapture: true,
                biometricAuth: true,
                deviceFingerprinting: true,
                ...config.device,
            },
        };
        this.securityManager = new SecurityManager_1.SecurityManager();
    }
    /**
     * Initialize the SDK
     */
    async initialize() {
        if (this.initialized) {
            console.warn('VeriLens SDK already initialized');
            return;
        }
        try {
            console.log('🔧 Initializing VeriLens SDK...');
            // Initialize security manager
            await this.securityManager.initialize();
            // Perform security validation
            const securityCheck = await this.securityManager.performSecurityCheck();
            if (!securityCheck.passed) {
                const failedServices = securityCheck.results
                    .filter((r) => !r.passed)
                    .map((r) => r.service);
                console.warn('⚠️ Some security services failed:', failedServices);
            }
            this.initialized = true;
            console.log('✅ VeriLens SDK initialized successfully');
        }
        catch (error) {
            console.error('❌ SDK initialization failed:', error);
            throw new Error(`VeriLens SDK initialization failed: ${error.message}`);
        }
    }
    /**
     * Start secure camera
     */
    async startCamera(videoElement, options = {}) {
        this.ensureInitialized();
        const services = this.securityManager.getServices();
        if (!services.secureCamera) {
            throw new Error('Secure Camera service not available');
        }
        console.log('📸 Starting secure camera via SDK...');
        const canvas = options.canvas || document.createElement('canvas');
        const result = await services.secureCamera.startSecureCapture(videoElement, { canvas });
        if (!result.success) {
            throw new Error('Failed to start secure camera');
        }
        console.log('✅ Secure camera started via SDK');
    }
    /**
     * Capture photo with full security validation
     */
    async capturePhoto() {
        this.ensureInitialized();
        try {
            console.log('📸 Capturing photo via SDK...');
            const services = this.securityManager.getServices();
            // Pre-capture security check
            const securityCheck = await this.securityManager.performSecurityCheck();
            if (!securityCheck.passed) {
                return {
                    success: false,
                    error: `Security validation failed: ${securityCheck.results
                        .filter((r) => !r.passed)
                        .map((r) => r.service)
                        .join(', ')}`,
                };
            }
            // Capture image
            if (!services.secureCamera) {
                throw new Error('Secure Camera service not available');
            }
            const captureResult = await services.secureCamera.captureSecureImage();
            if (!captureResult.success) {
                return { success: false, error: 'Image capture failed' };
            }
            // Generate hash
            const imageHash = await this.generateSecureHash(captureResult.image.blob);
            // Collect device attestation
            const deviceAttestation = await this.securityManager.collectDeviceAttestation();
            // Calculate trust score
            const trustScore = this.securityManager.calculateTrustScore(captureResult, deviceAttestation);
            // Create verification object
            const verification = {
                trustScore,
                securityLevel: this.config.security?.securityLevel || 'maximum',
                sensorData: captureResult.sensorData,
                liveProof: captureResult.liveProof,
                deviceAttestation,
            };
            // Submit to blockchain
            const blockchainResult = await this.submitToBlockchain(imageHash, verification, services);
            // Security status
            const security = {
                tamperingDetected: false, // TODO: Get from anti-tampering service
                integrityPassed: securityCheck.passed,
                validationResults: captureResult.validation || [],
            };
            console.log('✅ Photo captured via SDK successfully');
            return {
                success: true,
                image: {
                    blob: captureResult.image.blob,
                    dataUrl: captureResult.image.dataUrl,
                    hash: imageHash,
                    metadata: captureResult.image,
                },
                verification,
                blockchain: blockchainResult,
                security,
            };
        }
        catch (error) {
            console.error('❌ Photo capture failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    /**
     * Verify image hash
     */
    async verifyImage(imageHash) {
        this.ensureInitialized();
        try {
            console.log('🔍 Verifying image via SDK:', imageHash.substring(0, 16) + '...');
            const services = this.securityManager.getServices();
            if (!services.blockchain) {
                return { exists: false, verified: false };
            }
            const blockchainResult = await services.blockchain.verifyImageHash(imageHash);
            // Additional security checks
            const securityCheck = await this.securityManager.performSecurityCheck();
            const securityChecks = {
                codeIntegrity: securityCheck.results.find((r) => r.service === 'anti-tampering')
                    ?.passed || false,
                deviceValidation: !!services.hardwareAttestation,
                sensorValidation: !!services.deviceSensor,
            };
            return {
                exists: blockchainResult.exists,
                verified: blockchainResult.verified,
                trustScore: blockchainResult.trustScore,
                timestamp: blockchainResult.timestamp,
                deviceId: blockchainResult.deviceId,
                submitter: blockchainResult.submitter,
                network: blockchainResult.network,
                securityChecks,
            };
        }
        catch (error) {
            console.error('❌ Image verification failed:', error);
            return { exists: false, verified: false };
        }
    }
    /**
     * Get SDK status
     */
    getStatus() {
        const services = this.securityManager.getServices();
        return {
            initialized: this.initialized,
            config: this.config,
            security: {
                antiTampering: services.antiTampering ? 'available' : 'not-available',
                hardwareAttestation: services.hardwareAttestation
                    ? 'available'
                    : 'not-available',
                deviceSensor: services.deviceSensor ? 'available' : 'not-available',
                blockchain: services.blockchain ? 'available' : 'not-available',
                secureCamera: services.secureCamera ? 'available' : 'not-available',
            },
            servicesCount: Object.keys(services).length,
        };
    }
    /**
     * Destroy SDK and cleanup
     */
    async destroy() {
        console.log('🛑 Destroying VeriLens SDK...');
        const services = this.securityManager.getServices();
        if (services.secureCamera) {
            services.secureCamera.stopSecureCapture();
        }
        this.initialized = false;
        console.log('✅ VeriLens SDK destroyed');
    }
    // Private helper methods
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('VeriLens SDK not initialized. Call initialize() first.');
        }
    }
    async generateSecureHash(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    async submitToBlockchain(imageHash, verification, services) {
        if (!services.blockchain ||
            !this.config.security?.enableBlockchainVerification) {
            return {
                success: false,
                network: 'disabled',
                transactionHash: 'none',
                timestamp: new Date().toISOString(),
                verified: false,
            };
        }
        try {
            const deviceId = verification.deviceAttestation?.deviceFingerprint?.substring(0, 16) ||
                'unknown';
            const result = await services.blockchain.submitImageHash(imageHash, { trustScore: verification.trustScore }, deviceId);
            return {
                success: result.success,
                transactionHash: result.transactionHash,
                network: result.network,
                timestamp: result.timestamp,
                verified: true,
            };
        }
        catch (error) {
            console.error('Blockchain submission failed:', error);
            return {
                success: false,
                error: error.message,
                network: 'failed',
                transactionHash: 'failed',
                timestamp: new Date().toISOString(),
                verified: false,
            };
        }
    }
}
exports.VeriLensSDK = VeriLensSDK;
// Export for global access
if (typeof window !== 'undefined') {
    window.VeriLensSDK = VeriLensSDK;
}
exports.default = VeriLensSDK;
