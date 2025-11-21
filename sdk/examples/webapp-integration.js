/**
 * VeriLens SDK - JavaScript Example Usage
 * Shows how the webapp should use the SDK instead of directly importing security services
 */

// Example: Using VeriLens SDK in a webapp
class VeriLensWebApp {
  constructor() {
    this.sdk = null;
    this.videoElement = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the VeriLens SDK with security configuration
   */
  async initializeSDK() {
    try {
      console.log('🚀 Initializing VeriLens Web Application...');

      // Load the security services (this would normally be bundled)
      await this.loadSecurityModules();

      // Create SDK instance with configuration
      this.sdk = new VeriLensSDK({
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
      });

      // Initialize the SDK
      await this.sdk.initialize();

      this.isInitialized = true;
      console.log('✅ VeriLens SDK initialized successfully');

      return true;
    } catch (error) {
      console.error('❌ SDK initialization failed:', error);
      return false;
    }
  }

  /**
   * Load security modules (in production, these would be bundled)
   */
  async loadSecurityModules() {
    const modules = [
      '/app/mobile-camera/anti-tampering.js',
      '/app/mobile-camera/device-sensor-service.js',
      '/app/mobile-camera/hardware-attestation.js',
      '/app/mobile-camera/blockchain-service.js',
      '/app/mobile-camera/secure-camera-api.js',
    ];

    // In production, these would be imported as ES modules or bundled
    // For demo, we're loading them as scripts
    console.log('📦 Loading security modules...');
  }

  /**
   * Start camera with SDK
   */
  async startCamera() {
    if (!this.isInitialized) {
      throw new Error('SDK not initialized');
    }

    try {
      // Create video element
      this.videoElement =
        document.getElementById('camera-video') || this.createVideoElement();

      // Start secure camera using SDK
      await this.sdk.startCamera(this.videoElement);

      console.log('📸 Secure camera started via SDK');
      return true;
    } catch (error) {
      console.error('❌ Camera start failed:', error);
      return false;
    }
  }

  /**
   * Capture photo using SDK
   */
  async capturePhoto() {
    if (!this.isInitialized || !this.videoElement) {
      throw new Error('Camera not ready');
    }

    try {
      console.log('📸 Capturing photo via SDK...');

      // Use SDK to capture with all security features
      const result = await this.sdk.capturePhoto();

      if (result.success) {
        console.log('✅ Photo captured successfully:', {
          hash: result.image.hash.substring(0, 16) + '...',
          trustScore: result.verification.trustScore,
          blockchain: result.blockchain.network,
          security: result.security.integrityPassed,
        });

        return result;
      } else {
        console.error('❌ Photo capture failed:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Capture error:', error);
      return null;
    }
  }

  /**
   * Verify an image using SDK
   */
  async verifyImage(imageHash) {
    if (!this.isInitialized) {
      throw new Error('SDK not initialized');
    }

    try {
      console.log('🔍 Verifying image via SDK...');

      const result = await this.sdk.verifyImage(imageHash);

      console.log('✅ Verification result:', {
        exists: result.exists,
        verified: result.verified,
        trustScore: result.trustScore,
        network: result.network,
      });

      return result;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return null;
    }
  }

  /**
   * Get SDK status
   */
  getSDKStatus() {
    if (!this.sdk) {
      return { initialized: false, error: 'SDK not created' };
    }

    return this.sdk.getStatus();
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.sdk) {
      await this.sdk.destroy();
    }

    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject;
      stream.getTracks().forEach((track) => track.stop());
    }

    console.log('🧹 VeriLens webapp cleaned up');
  }

  // Helper methods
  createVideoElement() {
    const video = document.createElement('video');
    video.id = 'camera-video';
    video.autoplay = true;
    video.playsInline = true;
    return video;
  }
}

// Example usage in HTML page
const exampleUsage = `
<!DOCTYPE html>
<html>
<head>
    <title>VeriLens SDK Example</title>
</head>
<body>
    <h1>VeriLens SDK - Secure Photo Verification</h1>
    
    <div id="app">
        <video id="camera-video" autoplay playsinline></video>
        <button id="start-camera">Start Camera</button>
        <button id="capture-photo">Capture Photo</button>
        <button id="verify-photo">Verify Photo</button>
        <div id="status"></div>
        <div id="result"></div>
    </div>

    <!-- Load VeriLens SDK -->
    <script src="/sdk/core/VeriLensSecureSDK.js"></script>
    
    <script>
        // Initialize the webapp
        const app = new VeriLensWebApp();
        
        // UI Event Handlers
        document.getElementById('start-camera').addEventListener('click', async () => {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = 'Initializing SDK...';
            
            const initialized = await app.initializeSDK();
            if (initialized) {
                const cameraStarted = await app.startCamera();
                if (cameraStarted) {
                    statusDiv.textContent = 'Camera ready - SDK active with maximum security';
                } else {
                    statusDiv.textContent = 'Camera failed to start';
                }
            } else {
                statusDiv.textContent = 'SDK initialization failed';
            }
        });
        
        document.getElementById('capture-photo').addEventListener('click', async () => {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = 'Capturing with security validation...';
            
            const result = await app.capturePhoto();
            if (result) {
                resultDiv.innerHTML = \`
                    <h3>Photo Captured Successfully!</h3>
                    <p>Hash: \${result.image.hash.substring(0, 32)}...</p>
                    <p>Trust Score: \${result.verification.trustScore}/100</p>
                    <p>Network: \${result.blockchain.network}</p>
                    <p>Security: \${result.security.integrityPassed ? '✅ Passed' : '❌ Failed'}</p>
                    <p>Transaction: \${result.blockchain.transactionHash}</p>
                \`;
            } else {
                resultDiv.textContent = 'Capture failed';
            }
        });
        
        document.getElementById('verify-photo').addEventListener('click', async () => {
            const hash = prompt('Enter image hash to verify:');
            if (hash) {
                const result = await app.verifyImage(hash);
                const resultDiv = document.getElementById('result');
                
                if (result && result.verified) {
                    resultDiv.innerHTML = \`
                        <h3>Image Verified ✅</h3>
                        <p>Exists: \${result.exists}</p>
                        <p>Trust Score: \${result.trustScore}/100</p>
                        <p>Timestamp: \${result.timestamp}</p>
                        <p>Network: \${result.network}</p>
                    \`;
                } else {
                    resultDiv.innerHTML = '<h3>Image Not Verified ❌</h3>';
                }
            }
        });
    </script>
</body>
</html>
`;

// Export for use
window.VeriLensWebApp = VeriLensWebApp;
window.exampleUsage = exampleUsage;

console.log('📖 VeriLens SDK Example Usage loaded');
console.log('🔧 Use: const app = new VeriLensWebApp(); app.initializeSDK();');
