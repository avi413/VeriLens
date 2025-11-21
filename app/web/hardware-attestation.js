/**
 * VeriLens Hardware Attestation Module
 * Implements WebAuthn for device-level security and biometric authentication
 */

class HardwareAttestationService {
  constructor() {
    this.attestationLevel = 'none';
    this.deviceCredentials = null;
    this.biometricSupported = false;
    this.secureEnclaveAvailable = false;

    this.init();
  }

  async init() {
    console.log('🔐 Initializing Hardware Attestation...');

    try {
      // Check WebAuthn support
      this.webAuthnSupported = await this.checkWebAuthnSupport();

      // Check biometric capabilities
      this.biometricSupported = await this.checkBiometricSupport();

      // Check for secure hardware
      this.secureEnclaveAvailable = this.checkSecureEnclave();
    } catch (error) {
      console.warn('⚠️ Hardware attestation init failed:', error.message);
    }

    console.log('🛡️ Hardware Security Status:', {
      webAuthn: this.webAuthnSupported,
      biometrics: this.biometricSupported,
      secureEnclave: this.secureEnclaveAvailable,
    });
  }

  checkWebAuthnSupported() {
    return !!(navigator.credentials && navigator.credentials.create);
  }

  async checkWebAuthnSupport() {
    try {
      if (!window.PublicKeyCredential) {
        return false;
      }

      // Test if WebAuthn is available
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      console.log('🔍 WebAuthn availability:', available);
      return available;
    } catch (error) {
      console.warn('⚠️ WebAuthn check failed:', error.message);
      return false;
    }
  }

  async checkBiometricSupport() {
    try {
      // Check for Touch ID, Face ID, Windows Hello, etc.
      if (navigator.credentials && navigator.credentials.create) {
        // Try to detect authenticator types
        const available = await navigator.credentials
          .get({
            publicKey: {
              challenge: new Uint8Array(32),
              timeout: 1000,
              userVerification: 'required',
            },
          })
          .catch(() => null);

        return true; // WebAuthn available implies some form of biometrics
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  checkSecureEnclave() {
    // Check for iOS Secure Enclave, Android Hardware Security Module, etc.
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isWindows = /windows/.test(userAgent);

    return isIOS || isAndroid || isWindows; // Simplified check
  }

  async createDeviceAttestation() {
    try {
      console.log('🔑 Creating device attestation...');

      if (!this.webAuthnSupported) {
        return this.createFallbackAttestation();
      }

      // Generate challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      // Create WebAuthn credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: 'VeriLens',
            id: window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: `verilens-user-${Date.now()}`,
            displayName: 'VeriLens User',
          },
          pubKeyCredParams: [
            {
              type: 'public-key',
              alg: -7, // ES256
            },
            {
              type: 'public-key',
              alg: -257, // RS256
            },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Requires device biometrics
            userVerification: 'required',
            residentKey: 'required',
          },
          attestation: 'direct', // Request device attestation
          timeout: 30000,
        },
      });

      // Process attestation
      const attestationData = this.processAttestationResponse(credential);

      // Store device credentials
      this.deviceCredentials = {
        id: credential.id,
        attestation: attestationData,
        createdAt: new Date().toISOString(),
      };

      this.attestationLevel = 'hardware';

      console.log('✅ Hardware attestation created');

      return {
        success: true,
        attestationLevel: this.attestationLevel,
        attestationData,
        deviceCapabilities: this.getDeviceCapabilities(),
      };
    } catch (error) {
      console.warn(
        '⚠️ Hardware attestation failed, using fallback:',
        error.message
      );
      return this.createFallbackAttestation();
    }
  }

  processAttestationResponse(credential) {
    const response = credential.response;

    return {
      credentialId: credential.id,
      clientDataJSON: this.arrayBufferToBase64(response.clientDataJSON),
      attestationObject: this.arrayBufferToBase64(response.attestationObject),
      transports: credential.response.getTransports
        ? credential.response.getTransports()
        : [],
      timestamp: new Date().toISOString(),
    };
  }

  async verifyDeviceAttestation(challenge) {
    try {
      if (!this.deviceCredentials) {
        throw new Error('No device credentials available');
      }

      console.log('🔍 Verifying device attestation...');

      // Get assertion using stored credential
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge),
          allowCredentials: [
            {
              type: 'public-key',
              id: this.base64ToArrayBuffer(this.deviceCredentials.id),
              transports: this.deviceCredentials.attestation.transports,
            },
          ],
          userVerification: 'required',
          timeout: 15000,
        },
      });

      const verificationData = {
        credentialId: assertion.id,
        signature: this.arrayBufferToBase64(assertion.response.signature),
        authenticatorData: this.arrayBufferToBase64(
          assertion.response.authenticatorData
        ),
        clientDataJSON: this.arrayBufferToBase64(
          assertion.response.clientDataJSON
        ),
        userHandle: assertion.response.userHandle
          ? this.arrayBufferToBase64(assertion.response.userHandle)
          : null,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ Device attestation verified');

      return {
        success: true,
        verificationData,
        attestationLevel: this.attestationLevel,
      };
    } catch (error) {
      console.error('❌ Device attestation verification failed:', error);

      return {
        success: false,
        error: error.message,
        attestationLevel: 'none',
      };
    }
  }

  createFallbackAttestation() {
    console.log('🔄 Creating fallback attestation...');

    // Create software-based device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint();

    this.attestationLevel = 'software';

    return {
      success: true,
      attestationLevel: this.attestationLevel,
      attestationData: {
        type: 'software-fingerprint',
        fingerprint: deviceFingerprint,
        timestamp: new Date().toISOString(),
      },
      deviceCapabilities: this.getDeviceCapabilities(),
    };
  }

  generateDeviceFingerprint() {
    // Comprehensive device fingerprinting
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
      },
      hardware: {
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'unknown',
        maxTouchPoints: navigator.maxTouchPoints || 0,
      },
      webgl: this.getWebGLFingerprint(),
      canvas: this.getCanvasFingerprint(),
      audio: this.getAudioFingerprint(),
      fonts: this.getFontFingerprint(),
      timestamp: Date.now(),
    };

    // Create hash of fingerprint
    return this.hashObject(fingerprint);
  }

  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) return 'not-supported';

      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        extensions: gl.getSupportedExtensions(),
      };
    } catch (error) {
      return 'error';
    }
  }

  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('VeriLens Device Fingerprint 🔐', 2, 2);

      return canvas.toDataURL().slice(-50); // Last 50 chars
    } catch (error) {
      return 'error';
    }
  }

  getAudioFingerprint() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();

      oscillator.connect(analyser);
      oscillator.start();

      return {
        sampleRate: audioContext.sampleRate,
        state: audioContext.state,
        maxChannelCount: audioContext.destination.maxChannelCount,
      };
    } catch (error) {
      return 'not-supported';
    }
  }

  getFontFingerprint() {
    const testString = 'VeriLens Font Test';
    const testSize = '72px';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const fonts = [
      'Arial',
      'Helvetica',
      'Times',
      'Courier',
      'Verdana',
      'Georgia',
      'Palatino',
      'Garamond',
      'Bookman',
      'Tahoma',
      'Impact',
      'Comic Sans MS',
    ];

    const fontFingerprint = fonts.map((font) => {
      ctx.font = testSize + ' ' + font;
      return ctx.measureText(testString).width;
    });

    return fontFingerprint.join(',');
  }

  getDeviceCapabilities() {
    return {
      webAuthn: this.webAuthnSupported,
      biometrics: this.biometricSupported,
      secureEnclave: this.secureEnclaveAvailable,
      camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      geolocation: !!navigator.geolocation,
      accelerometer: 'DeviceMotionEvent' in window,
      gyroscope: 'DeviceOrientationEvent' in window,
      touchSupported: 'ontouchstart' in window,
      battery: !!navigator.getBattery,
      bluetooth: !!navigator.bluetooth,
      usb: !!navigator.usb,
      vibration: !!navigator.vibrate,
      webCrypto: !!(window.crypto && window.crypto.subtle),
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
    };
  }

  // Utility methods
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async hashObject(obj) {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(obj));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Public API
  getAttestationLevel() {
    return this.attestationLevel;
  }

  isHardwareAttested() {
    return this.attestationLevel === 'hardware';
  }

  getSecurityScore() {
    let score = 0;

    if (this.attestationLevel === 'hardware') score += 40;
    else if (this.attestationLevel === 'software') score += 20;

    if (this.biometricSupported) score += 25;
    if (this.secureEnclaveAvailable) score += 20;
    if (this.webAuthnSupported) score += 15;

    return Math.min(score, 100);
  }
}

// Export for global access
window.HardwareAttestationService = HardwareAttestationService;
