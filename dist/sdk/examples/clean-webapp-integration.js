"use strict";
/**
 * VeriLens WebApp Integration - Clean Architecture Example
 *
 * This shows how the webapp should properly consume the VeriLens SDK.
 * The SDK now contains all the core logic, the webapp is just a thin UI layer.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriLensWebApp = void 0;
const VeriLensRefactoredSDK_1 = require("../core/VeriLensRefactoredSDK");
/**
 * VeriLens WebApp - Clean Implementation Using SDK
 *
 * This webapp is now a simple consumer of the VeriLens SDK.
 * All security, blockchain, and verification logic is handled by the SDK.
 */
class VeriLensWebApp {
    sdk;
    videoElement;
    statusElement;
    constructor(config = {}) {
        // Initialize SDK with configuration
        this.sdk = new VeriLensRefactoredSDK_1.VeriLensSDK({
            security: {
                enableAntiTampering: true,
                enableHardwareAttestation: true,
                enableSensorValidation: true,
                enableBlockchainVerification: true,
                securityLevel: 'maximum',
            },
            blockchain: {
                network: 'polygon',
                fallbackToLocal: true,
            },
            camera: {
                quality: 0.98,
                frameValidation: true,
                motionDetection: true,
                liveProofRequired: true,
            },
            device: {
                sensorCapture: true,
                biometricAuth: true,
                deviceFingerprinting: true,
            },
            ...config,
        });
        console.log('🌐 VeriLens WebApp initialized with SDK');
    }
    /**
     * Initialize the WebApp and SDK
     */
    async initialize() {
        try {
            this.updateStatus('Initializing VeriLens SDK...');
            // Let the SDK handle all initialization logic
            await this.sdk.initialize();
            this.updateStatus('VeriLens SDK ready ✅');
            console.log('✅ WebApp initialized successfully');
        }
        catch (error) {
            this.updateStatus(`Initialization failed: ${error.message}`);
            console.error('❌ WebApp initialization failed:', error);
            throw error;
        }
    }
    /**
     * Start camera (simple wrapper around SDK)
     */
    async startCamera() {
        try {
            this.videoElement = document.getElementById('videoElement');
            if (!this.videoElement) {
                throw new Error('Video element not found');
            }
            this.updateStatus('Starting secure camera...');
            // SDK handles all the security logic
            await this.sdk.startCamera(this.videoElement);
            this.updateStatus('Camera ready 📸');
        }
        catch (error) {
            this.updateStatus(`Camera failed: ${error.message}`);
            throw error;
        }
    }
    /**
     * Capture photo (simple wrapper around SDK)
     */
    async capturePhoto() {
        try {
            this.updateStatus('Capturing secure photo...');
            // SDK handles all capture, security, blockchain logic
            const result = await this.sdk.capturePhoto();
            if (result.success) {
                this.displayCaptureResult(result);
                this.updateStatus(`Photo captured successfully! Trust Score: ${result.verification?.trustScore}/100`);
            }
            else {
                this.updateStatus(`Capture failed: ${result.error}`);
            }
        }
        catch (error) {
            this.updateStatus(`Capture error: ${error.message}`);
            console.error('❌ Capture failed:', error);
        }
    }
    /**
     * Verify image hash (simple wrapper around SDK)
     */
    async verifyImage(hash) {
        try {
            this.updateStatus('Verifying image...');
            // SDK handles all verification logic
            const result = await this.sdk.verifyImage(hash);
            this.displayVerificationResult(result);
            if (result.verified) {
                this.updateStatus(`✅ Image verified! Trust Score: ${result.trustScore}/100`);
            }
            else {
                this.updateStatus('❌ Image not found or verification failed');
            }
        }
        catch (error) {
            this.updateStatus(`Verification error: ${error.message}`);
        }
    }
    /**
     * Get system status (simple wrapper around SDK)
     */
    getStatus() {
        return this.sdk.getStatus();
    }
    /**
     * Shutdown (simple wrapper around SDK)
     */
    async destroy() {
        this.updateStatus('Shutting down...');
        await this.sdk.destroy();
        this.updateStatus('Shutdown complete');
    }
    // UI Helper Methods (webapp-specific, not in SDK)
    updateStatus(message) {
        console.log(`[WebApp] ${message}`);
        if (!this.statusElement) {
            this.statusElement = document.getElementById('status') || undefined;
        }
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }
    displayCaptureResult(result) {
        // Display image
        const imageElement = document.getElementById('capturedImage');
        if (imageElement && result.image?.dataUrl) {
            imageElement.src = result.image.dataUrl;
            imageElement.style.display = 'block';
        }
        // Display metadata
        const metadataElement = document.getElementById('metadata');
        if (metadataElement) {
            metadataElement.innerHTML = `
        <h3>Capture Results</h3>
        <p><strong>Hash:</strong> ${result.image?.hash}</p>
        <p><strong>Trust Score:</strong> ${result.verification?.trustScore}/100</p>
        <p><strong>Security Level:</strong> ${result.verification?.securityLevel}</p>
        <p><strong>Blockchain:</strong> ${result.blockchain?.network} - ${result.blockchain?.transactionHash}</p>
        <p><strong>Timestamp:</strong> ${result.blockchain?.timestamp}</p>
        <p><strong>Integrity Check:</strong> ${result.security?.integrityPassed ? '✅' : '❌'}</p>
      `;
        }
    }
    displayVerificationResult(result) {
        const resultElement = document.getElementById('verificationResult');
        if (resultElement) {
            resultElement.innerHTML = `
        <h3>Verification Results</h3>
        <p><strong>Exists:</strong> ${result.exists ? '✅' : '❌'}</p>
        <p><strong>Verified:</strong> ${result.verified ? '✅' : '❌'}</p>
        <p><strong>Trust Score:</strong> ${result.trustScore || 'N/A'}</p>
        <p><strong>Timestamp:</strong> ${result.timestamp || 'N/A'}</p>
        <p><strong>Device ID:</strong> ${result.deviceId || 'N/A'}</p>
        <p><strong>Network:</strong> ${result.network || 'N/A'}</p>
        <p><strong>Security Checks:</strong></p>
        <ul>
          <li>Code Integrity: ${result.securityChecks?.codeIntegrity ? '✅' : '❌'}</li>
          <li>Device Validation: ${result.securityChecks?.deviceValidation ? '✅' : '❌'}</li>
          <li>Sensor Validation: ${result.securityChecks?.sensorValidation ? '✅' : '❌'}</li>
        </ul>
      `;
        }
    }
}
exports.VeriLensWebApp = VeriLensWebApp;
// Global initialization for browser
if (typeof window !== 'undefined') {
    window.VeriLensWebApp = VeriLensWebApp;
    // Auto-initialize when DOM loads
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🌐 Auto-initializing VeriLens WebApp...');
        const app = new VeriLensWebApp();
        window.veriLensApp = app;
        try {
            await app.initialize();
            // Set up event listeners
            const startCameraBtn = document.getElementById('startCamera');
            const captureBtn = document.getElementById('capturePhoto');
            const statusBtn = document.getElementById('getStatus');
            if (startCameraBtn) {
                startCameraBtn.addEventListener('click', () => app.startCamera());
            }
            if (captureBtn) {
                captureBtn.addEventListener('click', () => app.capturePhoto());
            }
            if (statusBtn) {
                statusBtn.addEventListener('click', () => {
                    const status = app.getStatus();
                    console.log('📊 System Status:', status);
                });
            }
            console.log('✅ WebApp ready for use');
        }
        catch (error) {
            console.error('❌ WebApp initialization failed:', error);
        }
    });
}
exports.default = VeriLensWebApp;
