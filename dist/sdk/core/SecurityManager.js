"use strict";
/**
 * VeriLens SDK - Security Services Core
 * All security logic moved from webapp to SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityManager = void 0;
/**
 * Security Manager - Coordinates all security services
 */
class SecurityManager {
    services = {};
    constructor() {
        this.loadSecurityServices();
    }
    loadSecurityServices() {
        // Load services from global window (webapp implementations)
        if (typeof window !== 'undefined') {
            const w = window;
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
    async initialize() {
        // Wait for services to initialize
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    getServices() {
        return this.services;
    }
    async performSecurityCheck() {
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
            const capabilities = this.services.hardwareAttestation.getDeviceCapabilities();
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
    async collectDeviceAttestation() {
        const attestation = {};
        if (this.services.hardwareAttestation) {
            try {
                attestation.deviceFingerprint =
                    await this.services.hardwareAttestation.generateDeviceFingerprint();
                attestation.biometricCapabilities =
                    await this.services.hardwareAttestation.detectBiometricCapabilities();
            }
            catch (error) {
                attestation.hardwareError = error;
            }
        }
        if (this.services.deviceSensor) {
            try {
                attestation.deviceSignature =
                    await this.services.deviceSensor.generateDeviceSignature();
                attestation.sensorData = this.services.deviceSensor.getSensorStatus();
            }
            catch (error) {
                attestation.sensorError = error;
            }
        }
        return attestation;
    }
    calculateTrustScore(captureResult, deviceAttestation) {
        let score = 50; // Base score
        // Camera security validation
        if (captureResult?.validation?.overall)
            score += 20;
        if (captureResult?.sensorData?.success)
            score += 10;
        if (captureResult?.liveProof)
            score += 15;
        // Device attestation
        if (deviceAttestation?.deviceFingerprint)
            score += 5;
        if (deviceAttestation?.biometricCapabilities?.available)
            score += 10;
        // Security services status
        if (this.services.antiTampering) {
            const status = this.services.antiTampering.getTamperingStatus();
            if (!status?.tamperingDetected)
                score += 10;
        }
        return Math.min(100, Math.max(0, score));
    }
}
exports.SecurityManager = SecurityManager;
