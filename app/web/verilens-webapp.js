/**
 * VeriLens WebApp - Browser Compatible Version
 * Uses the VeriLens SDK directly in the browser
 */

class VeriLensWebApp {
  constructor(config = {}) {
    // Check if VeriLensSDK is available globally
    if (typeof window.VeriLensSDK === 'undefined') {
      throw new Error(
        'VeriLensSDK not available. Please ensure SDK is loaded.'
      );
    }

    // Initialize SDK with configuration
    this.sdk = new window.VeriLensSDK({
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
    } catch (error) {
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
    } catch (error) {
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
        this.updateStatus(
          `Photo captured successfully! Trust Score: ${result.verification?.trustScore}/100`
        );
        return result;
      } else {
        this.updateStatus(`Capture failed: ${result.error}`);
        return result;
      }
    } catch (error) {
      this.updateStatus(`Capture error: ${error.message}`);
      console.error('❌ Capture failed:', error);
      throw error;
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
        this.updateStatus(
          `✅ Image verified! Trust Score: ${result.trustScore}/100`
        );
      } else {
        this.updateStatus('❌ Image not found or verification failed');
      }

      return result;
    } catch (error) {
      this.updateStatus(`Verification error: ${error.message}`);
      throw error;
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
      this.statusElement =
        document.getElementById('status') ||
        document.getElementById('statusText');
    }

    if (this.statusElement) {
      this.statusElement.textContent = message;
    }
  }

  displayCaptureResult(result) {
    // This would be called by the main app
    console.log('📸 Capture Result:', result);
  }

  displayVerificationResult(result) {
    // This would be called by the main app
    console.log('🔍 Verification Result:', result);
  }
}

// Make VeriLensWebApp available globally
if (typeof window !== 'undefined') {
  window.VeriLensWebApp = VeriLensWebApp;
  console.log('✅ VeriLensWebApp loaded globally');
  console.log('📦 VeriLensWebApp:', typeof window.VeriLensWebApp);
} else {
  console.error('❌ Window object not available for VeriLensWebApp!');
}
