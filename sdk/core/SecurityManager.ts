/**
 * VeriLens SDK - Security Services Core
 * All security logic moved from webapp to SDK
 */

// Security service interfaces for the SDK
export interface IAntiTamperingService {
  verifyCodeIntegrity(): { passed: boolean; status: string };
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
  submitImageHash(
    hash: string,
    verification: any,
    deviceId: string
  ): Promise<any>;
  verifyImageHash(hash: string): Promise<any>;
}

export interface ISecureCameraAPI {
  startSecureCapture(
    videoElement: HTMLVideoElement,
    options?: any
  ): Promise<any>;
  captureSecureImage(): Promise<any>;
  getSecurityStatus(): any;
  getEnabledSecurityFeatures(): any;
  stopSecureCapture(): void;
}

/**
 * Security Manager - Coordinates all security services
 */
export class SecurityManager {
  private services: {
    antiTampering?: IAntiTamperingService;
    deviceSensor?: IDeviceSensorService;
    hardwareAttestation?: IHardwareAttestationService;
    blockchain?: IBlockchainService;
    secureCamera?: ISecureCameraAPI;
  } = {};

  constructor() {
    this.loadSecurityServices();
  }

  private loadSecurityServices(): void {
    // Load services from global window (webapp implementations)
    if (typeof window !== 'undefined') {
      const w = window as any;

      if (w.AntiTamperingService) {
        this.services.antiTampering = new w.AntiTamperingService();
      }

      if (w.DeviceSensorService) {
        this.services.deviceSensor = new w.DeviceSensorService();
      }

      if (w.HardwareAttestationService) {
        this.services.hardwareAttestation = new w.HardwareAttestationService();
      }

      if (w.BlockchainService) {
        this.services.blockchain = new w.BlockchainService();
      }

      if (w.SecureCameraAPI) {
        this.services.secureCamera = new w.SecureCameraAPI();
      }
    }
  }

  async initialize(): Promise<void> {
    // Wait for services to initialize
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  getServices() {
    return this.services;
  }

  async performSecurityCheck(): Promise<{ passed: boolean; results: any[] }> {
    const results = [];

    // Anti-tampering check
    if (this.services.antiTampering) {
      const integrity = this.services.antiTampering.verifyCodeIntegrity();
      results.push({
        service: 'anti-tampering',
        passed: integrity?.passed || false,
        details: integrity,
      });
    }

    // Hardware attestation check
    if (this.services.hardwareAttestation) {
      const capabilities =
        this.services.hardwareAttestation.getDeviceCapabilities();
      results.push({
        service: 'hardware-attestation',
        passed: capabilities && Object.keys(capabilities).length > 0,
        details: capabilities,
      });
    }

    // Blockchain connectivity check
    if (this.services.blockchain) {
      const connected = this.services.blockchain.isConnected();
      const stats = await this.services.blockchain.getBlockchainStats();
      results.push({
        service: 'blockchain',
        passed: connected || stats?.network === 'local-fallback',
        details: { connected, stats },
      });
    }

    const allPassed = results.every((r) => r.passed);
    return { passed: allPassed, results };
  }

  async collectDeviceAttestation(): Promise<any> {
    const attestation: any = {};

    if (this.services.hardwareAttestation) {
      try {
        attestation.deviceFingerprint =
          await this.services.hardwareAttestation.generateDeviceFingerprint();
        attestation.biometricCapabilities =
          await this.services.hardwareAttestation.detectBiometricCapabilities();
      } catch (error) {
        attestation.hardwareError = error;
      }
    }

    if (this.services.deviceSensor) {
      try {
        attestation.deviceSignature =
          await this.services.deviceSensor.generateDeviceSignature();
        attestation.sensorData = this.services.deviceSensor.getSensorStatus();
      } catch (error) {
        attestation.sensorError = error;
      }
    }

    return attestation;
  }

  calculateTrustScore(captureResult: any, deviceAttestation: any): number {
    let score = 50; // Base score

    // Camera security validation
    if (captureResult?.validation?.overall) score += 20;
    if (captureResult?.sensorData?.success) score += 10;
    if (captureResult?.liveProof) score += 15;

    // Device attestation
    if (deviceAttestation?.deviceFingerprint) score += 5;
    if (deviceAttestation?.biometricCapabilities?.available) score += 10;

    // Security services status
    if (this.services.antiTampering) {
      const status = this.services.antiTampering.getTamperingStatus();
      if (!status?.tamperingDetected) score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }
}
