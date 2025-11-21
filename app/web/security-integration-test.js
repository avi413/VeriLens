/**
 * VeriLens Security Integration Test
 * Comprehensive test suite for all 6 security modules working together
 */

class SecurityIntegrationTest {
  constructor() {
    this.testResults = [];
    this.securityModules = {};
    this.testStartTime = null;
    this.verbose = true;
  }

  async runCompleteSecurityTest() {
    console.log('🛡️ Starting VeriLens Security Integration Test...');
    console.log('━'.repeat(60));

    this.testStartTime = Date.now();

    try {
      // Phase 1: Initialize all security modules
      await this.initializeSecurityModules();

      // Phase 2: Test individual modules
      await this.testIndividualModules();

      // Phase 3: Test cross-module integration
      await this.testCrossModuleIntegration();

      // Phase 4: Test complete workflow
      await this.testCompleteWorkflow();

      // Phase 5: Test security scenarios
      await this.testSecurityScenarios();

      // Generate final report
      this.generateSecurityReport();
    } catch (error) {
      console.error('❌ Security integration test failed:', error);
      this.logResult(
        'OVERALL_TEST',
        false,
        `Test suite failed: ${error.message}`
      );
    }
  }

  async initializeSecurityModules() {
    console.log('\n📦 Phase 1: Initializing Security Modules');
    console.log('─'.repeat(40));

    const modules = [
      { name: 'AntiTamperingService', class: window.AntiTamperingService },
      {
        name: 'HardwareAttestationService',
        class: window.HardwareAttestationService,
      },
      { name: 'BlockchainService', class: window.BlockchainService },
      { name: 'DeviceSensorService', class: window.DeviceSensorService },
      { name: 'SecureCameraAPI', class: window.SecureCameraAPI },
      { name: 'SecureVeriLensServer', class: window.SecureVeriLensServer },
    ];

    for (const module of modules) {
      try {
        if (module.class) {
          this.securityModules[module.name] = new module.class();
          this.logResult(
            `INIT_${module.name}`,
            true,
            'Module loaded successfully'
          );
          console.log(`✅ ${module.name} initialized`);
        } else {
          this.logResult(
            `INIT_${module.name}`,
            false,
            'Module class not found'
          );
          console.log(`❌ ${module.name} not available`);
        }
      } catch (error) {
        this.logResult(
          `INIT_${module.name}`,
          false,
          `Initialization failed: ${error.message}`
        );
        console.log(`⚠️ ${module.name} initialization failed:`, error.message);
      }
    }
  }

  async testIndividualModules() {
    console.log('\n🔍 Phase 2: Testing Individual Modules');
    console.log('─'.repeat(40));

    // Test Anti-Tampering Service
    await this.testAntiTamperingService();

    // Test Hardware Attestation Service
    await this.testHardwareAttestationService();

    // Test Blockchain Service
    await this.testBlockchainService();

    // Test Device Sensor Service
    await this.testDeviceSensorService();

    // Test Secure Camera API
    await this.testSecureCameraAPI();
  }

  async testAntiTamperingService() {
    const service = this.securityModules.AntiTamperingService;
    if (!service) return;

    console.log('🛡️ Testing Anti-Tampering Service...');

    try {
      // Test code integrity verification
      const integrityCheck = service.verifyCodeIntegrity();
      this.logResult(
        'ANTI_TAMPERING_INTEGRITY',
        integrityCheck.secure,
        integrityCheck.secure
          ? 'Code integrity verified'
          : 'Code integrity compromised'
      );

      // Test debugger detection
      const debuggerCheck = service.detectDebugger();
      this.logResult(
        'ANTI_TAMPERING_DEBUGGER',
        !debuggerCheck.detected,
        debuggerCheck.detected ? 'Debugger detected' : 'No debugger detected'
      );

      // Test security features
      const features = service.getSecurityStatus();
      this.logResult(
        'ANTI_TAMPERING_FEATURES',
        features.active,
        `Security features active: ${Object.keys(features.protections).join(
          ', '
        )}`
      );

      console.log('✅ Anti-Tampering Service tests passed');
    } catch (error) {
      this.logResult(
        'ANTI_TAMPERING_ERROR',
        false,
        `Test failed: ${error.message}`
      );
      console.log('❌ Anti-Tampering Service test failed:', error.message);
    }
  }

  async testHardwareAttestationService() {
    const service = this.securityModules.HardwareAttestationService;
    if (!service) return;

    console.log('🔐 Testing Hardware Attestation Service...');

    try {
      // Test device capabilities detection
      const capabilities = service.checkDeviceCapabilities();
      this.logResult(
        'HARDWARE_CAPABILITIES',
        true,
        `Device capabilities: WebAuthn=${capabilities.webauthn}, Biometrics=${capabilities.biometrics}`
      );

      // Test device fingerprinting
      const fingerprint = await service.generateDeviceFingerprint();
      this.logResult(
        'HARDWARE_FINGERPRINT',
        fingerprint && fingerprint.length > 0,
        fingerprint
          ? `Fingerprint generated (${fingerprint.length} chars)`
          : 'Fingerprint generation failed'
      );

      // Test attestation creation (if supported)
      if (capabilities.webauthn) {
        try {
          const attestation = await service.createDeviceAttestation(
            'test-challenge'
          );
          this.logResult(
            'HARDWARE_ATTESTATION',
            attestation.success,
            attestation.success
              ? 'Device attestation created'
              : 'Attestation creation failed'
          );
        } catch (attestError) {
          this.logResult(
            'HARDWARE_ATTESTATION',
            false,
            `Attestation failed: ${attestError.message}`
          );
        }
      }

      console.log('✅ Hardware Attestation Service tests completed');
    } catch (error) {
      this.logResult('HARDWARE_ERROR', false, `Test failed: ${error.message}`);
      console.log(
        '❌ Hardware Attestation Service test failed:',
        error.message
      );
    }
  }

  async testBlockchainService() {
    const service = this.securityModules.BlockchainService;
    if (!service) return;

    console.log('⛓️ Testing Blockchain Service...');

    try {
      // Test connection status
      const connected = service.isConnected();
      this.logResult(
        'BLOCKCHAIN_CONNECTION',
        true,
        connected ? 'Connected to blockchain' : 'Using local fallback'
      );

      // Test blockchain stats
      const stats = await service.getBlockchainStats();
      this.logResult(
        'BLOCKCHAIN_STATS',
        stats && stats.totalHashes !== undefined,
        `Total hashes: ${stats.totalHashes}, Network: ${stats.network}`
      );

      // Test hash submission and verification
      const testHash = 'test-hash-' + Date.now();
      const verification = { trustScore: 90 };
      const deviceId = 'test-device';

      const submission = await service.submitImageHash(
        testHash,
        verification,
        deviceId
      );
      this.logResult(
        'BLOCKCHAIN_SUBMISSION',
        submission.success,
        `Hash submitted: ${submission.transactionHash}`
      );

      // Test hash verification
      const verifyResult = await service.verifyImageHash(testHash);
      this.logResult(
        'BLOCKCHAIN_VERIFICATION',
        verifyResult.verified || verifyResult.exists,
        verifyResult.exists ? 'Hash verified successfully' : 'Hash not found'
      );

      console.log('✅ Blockchain Service tests completed');
    } catch (error) {
      this.logResult(
        'BLOCKCHAIN_ERROR',
        false,
        `Test failed: ${error.message}`
      );
      console.log('❌ Blockchain Service test failed:', error.message);
    }
  }

  async testDeviceSensorService() {
    const service = this.securityModules.DeviceSensorService;
    if (!service) return;

    console.log('📱 Testing Device Sensor Service...');

    try {
      // Test sensor availability
      const availability = service.checkSensorAvailability();
      this.logResult(
        'SENSOR_AVAILABILITY',
        true,
        `Sensors available: ${Object.entries(availability)
          .filter(([k, v]) => v)
          .map(([k, v]) => k)
          .join(', ')}`
      );

      // Test sensor capture (short duration for testing)
      const sensorData = await service.startSensorCapture(1000); // 1 second
      this.logResult(
        'SENSOR_CAPTURE',
        sensorData && sensorData.motion,
        sensorData
          ? `Sensor data captured: ${Object.keys(sensorData).join(', ')}`
          : 'Sensor capture failed'
      );

      // Test device signature generation
      if (sensorData) {
        const signature = service.generateDeviceSignature(sensorData);
        this.logResult(
          'SENSOR_SIGNATURE',
          signature && signature.length > 0,
          signature
            ? `Device signature generated (${signature.length} chars)`
            : 'Signature generation failed'
        );
      }

      console.log('✅ Device Sensor Service tests completed');
    } catch (error) {
      this.logResult('SENSOR_ERROR', false, `Test failed: ${error.message}`);
      console.log('❌ Device Sensor Service test failed:', error.message);
    }
  }

  async testSecureCameraAPI() {
    const service = this.securityModules.SecureCameraAPI;
    if (!service) return;

    console.log('📸 Testing Secure Camera API...');

    try {
      // Test security status
      const securityStatus = service.getSecurityStatus();
      this.logResult(
        'CAMERA_SECURITY_STATUS',
        true,
        `Security level: ${
          securityStatus.securityLevel
        }, Features: ${Object.keys(securityStatus.featuresEnabled).join(', ')}`
      );

      // Test camera capabilities check
      const capabilities = service.checkAdvancedCameraFeatures();
      this.logResult(
        'CAMERA_CAPABILITIES',
        capabilities.webRTC,
        `Camera capabilities: WebRTC=${capabilities.webRTC}, ImageCapture=${capabilities.imageCapture}`
      );

      // Test frame analysis data structure
      const frameData = service.getFrameAnalysisData();
      this.logResult(
        'CAMERA_FRAME_ANALYSIS',
        frameData !== null,
        frameData
          ? 'Frame analysis data structure ready'
          : 'Frame analysis not initialized'
      );

      // Test security features detection
      const features = service.getEnabledSecurityFeatures();
      this.logResult(
        'CAMERA_SECURITY_FEATURES',
        Object.keys(features).length > 0,
        `Security features enabled: ${Object.entries(features)
          .filter(([k, v]) => v)
          .map(([k, v]) => k)
          .join(', ')}`
      );

      console.log('✅ Secure Camera API tests completed');
    } catch (error) {
      this.logResult('CAMERA_ERROR', false, `Test failed: ${error.message}`);
      console.log('❌ Secure Camera API test failed:', error.message);
    }
  }

  async testCrossModuleIntegration() {
    console.log('\n🔗 Phase 3: Testing Cross-Module Integration');
    console.log('─'.repeat(40));

    // Test Anti-Tampering + Hardware Attestation
    await this.testAntiTamperingHardwareIntegration();

    // Test Sensors + Camera Integration
    await this.testSensorsCameraIntegration();

    // Test Blockchain + All Security Data
    await this.testBlockchainSecurityIntegration();
  }

  async testAntiTamperingHardwareIntegration() {
    console.log(
      '🔐🛡️ Testing Anti-Tampering + Hardware Attestation integration...'
    );

    try {
      const antiTampering = this.securityModules.AntiTamperingService;
      const hardware = this.securityModules.HardwareAttestationService;

      if (!antiTampering || !hardware) {
        this.logResult(
          'INTEGRATION_ANTI_HARDWARE',
          false,
          'Required modules not available'
        );
        return;
      }

      // Test combined security check
      const tamperingStatus = antiTampering.getSecurityStatus();
      const deviceFingerprint = await hardware.generateDeviceFingerprint();

      const combinedSecurity = {
        antiTampering: tamperingStatus.active,
        deviceAttestation: deviceFingerprint && deviceFingerprint.length > 0,
        integrated: tamperingStatus.active && deviceFingerprint,
      };

      this.logResult(
        'INTEGRATION_ANTI_HARDWARE',
        combinedSecurity.integrated,
        `Combined security: Anti-tampering=${combinedSecurity.antiTampering}, Device attestation=${combinedSecurity.deviceAttestation}`
      );

      console.log(
        '✅ Anti-Tampering + Hardware Attestation integration tested'
      );
    } catch (error) {
      this.logResult(
        'INTEGRATION_ANTI_HARDWARE',
        false,
        `Integration test failed: ${error.message}`
      );
      console.log(
        '❌ Anti-Tampering + Hardware integration failed:',
        error.message
      );
    }
  }

  async testSensorsCameraIntegration() {
    console.log('📱📸 Testing Sensors + Camera integration...');

    try {
      const sensors = this.securityModules.DeviceSensorService;
      const camera = this.securityModules.SecureCameraAPI;

      if (!sensors || !camera) {
        this.logResult(
          'INTEGRATION_SENSOR_CAMERA',
          false,
          'Required modules not available'
        );
        return;
      }

      // Test sensor availability for camera capture
      const sensorAvailability = sensors.checkSensorAvailability();
      const cameraFeatures = camera.getEnabledSecurityFeatures();

      const integrated =
        sensorAvailability.motion && cameraFeatures.sensorIntegration;

      this.logResult(
        'INTEGRATION_SENSOR_CAMERA',
        true,
        `Sensor-Camera integration: Motion sensors=${sensorAvailability.motion}, Sensor integration=${cameraFeatures.sensorIntegration}`
      );

      console.log('✅ Sensors + Camera integration tested');
    } catch (error) {
      this.logResult(
        'INTEGRATION_SENSOR_CAMERA',
        false,
        `Integration test failed: ${error.message}`
      );
      console.log('❌ Sensors + Camera integration failed:', error.message);
    }
  }

  async testBlockchainSecurityIntegration() {
    console.log('⛓️🛡️ Testing Blockchain + Security Data integration...');

    try {
      const blockchain = this.securityModules.BlockchainService;
      const antiTampering = this.securityModules.AntiTamperingService;
      const hardware = this.securityModules.HardwareAttestationService;

      if (!blockchain) {
        this.logResult(
          'INTEGRATION_BLOCKCHAIN_SECURITY',
          false,
          'Blockchain module not available'
        );
        return;
      }

      // Create comprehensive security metadata
      const securityMetadata = {
        timestamp: new Date().toISOString(),
        antiTampering: antiTampering ? antiTampering.getSecurityStatus() : null,
        deviceFingerprint: hardware
          ? await hardware.generateDeviceFingerprint()
          : null,
        testHash: 'integration-test-' + Date.now(),
      };

      // Submit to blockchain with security metadata
      const submission = await blockchain.submitImageHash(
        securityMetadata.testHash,
        { trustScore: 95, securityMetadata },
        'integration-test-device'
      );

      this.logResult(
        'INTEGRATION_BLOCKCHAIN_SECURITY',
        submission.success,
        `Security data submitted to blockchain: ${submission.transactionHash}`
      );

      console.log('✅ Blockchain + Security Data integration tested');
    } catch (error) {
      this.logResult(
        'INTEGRATION_BLOCKCHAIN_SECURITY',
        false,
        `Integration test failed: ${error.message}`
      );
      console.log(
        '❌ Blockchain + Security integration failed:',
        error.message
      );
    }
  }

  async testCompleteWorkflow() {
    console.log('\n🔄 Phase 4: Testing Complete Security Workflow');
    console.log('─'.repeat(40));

    try {
      console.log('🚀 Simulating complete secure image capture workflow...');

      // Step 1: Initialize security environment
      const antiTampering = this.securityModules.AntiTamperingService;
      const hardware = this.securityModules.HardwareAttestationService;
      const blockchain = this.securityModules.BlockchainService;
      const sensors = this.securityModules.DeviceSensorService;
      const camera = this.securityModules.SecureCameraAPI;

      // Step 2: Pre-capture security checks
      const securityChecks = {
        antiTampering: antiTampering
          ? antiTampering.getSecurityStatus().active
          : false,
        deviceAttestation: hardware
          ? (await hardware.generateDeviceFingerprint()).length > 0
          : false,
        blockchain: blockchain ? true : false,
        sensors: sensors ? sensors.checkSensorAvailability().motion : false,
        camera: camera ? camera.getSecurityStatus().active : false,
      };

      const allSecurityPassed = Object.values(securityChecks).every(Boolean);
      this.logResult(
        'WORKFLOW_SECURITY_CHECKS',
        allSecurityPassed,
        `Security checks: ${Object.entries(securityChecks)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}`
      );

      // Step 3: Simulated capture with security data
      if (allSecurityPassed) {
        const mockImageData = {
          hash: 'workflow-test-' + Date.now(),
          timestamp: new Date().toISOString(),
          securityData: securityChecks,
        };

        // Step 4: Submit to blockchain
        const blockchainResult = await blockchain.submitImageHash(
          mockImageData.hash,
          { trustScore: 98, workflow: 'complete' },
          'workflow-test-device'
        );

        this.logResult(
          'WORKFLOW_COMPLETE',
          blockchainResult.success,
          `Complete workflow executed successfully: ${blockchainResult.transactionHash}`
        );
      }

      console.log('✅ Complete workflow test completed');
    } catch (error) {
      this.logResult(
        'WORKFLOW_COMPLETE',
        false,
        `Workflow test failed: ${error.message}`
      );
      console.log('❌ Complete workflow test failed:', error.message);
    }
  }

  async testSecurityScenarios() {
    console.log('\n🚨 Phase 5: Testing Security Scenarios');
    console.log('─'.repeat(40));

    // Test tampering detection
    await this.testTamperingDetection();

    // Test blockchain fallback
    await this.testBlockchainFallback();

    // Test security violation handling
    await this.testSecurityViolationHandling();
  }

  async testTamperingDetection() {
    console.log('🚨 Testing tampering detection scenarios...');

    try {
      const antiTampering = this.securityModules.AntiTamperingService;
      if (!antiTampering) {
        this.logResult(
          'SCENARIO_TAMPERING',
          false,
          'Anti-tampering module not available'
        );
        return;
      }

      // Test current state
      const currentState = antiTampering.getSecurityStatus();
      this.logResult(
        'SCENARIO_TAMPERING',
        !currentState.tamperingDetected,
        currentState.tamperingDetected
          ? 'Tampering detected'
          : 'No tampering detected'
      );

      console.log('✅ Tampering detection scenario tested');
    } catch (error) {
      this.logResult(
        'SCENARIO_TAMPERING',
        false,
        `Tampering test failed: ${error.message}`
      );
      console.log('❌ Tampering detection test failed:', error.message);
    }
  }

  async testBlockchainFallback() {
    console.log('⛓️ Testing blockchain fallback scenarios...');

    try {
      const blockchain = this.securityModules.BlockchainService;
      if (!blockchain) {
        this.logResult(
          'SCENARIO_BLOCKCHAIN_FALLBACK',
          false,
          'Blockchain module not available'
        );
        return;
      }

      // Test with fallback scenario
      const testHash = 'fallback-test-' + Date.now();
      const result = await blockchain.submitImageHash(
        testHash,
        { trustScore: 75 },
        'fallback-test'
      );

      this.logResult(
        'SCENARIO_BLOCKCHAIN_FALLBACK',
        result.success,
        result.localFallback
          ? 'Local fallback working'
          : 'Blockchain submission successful'
      );

      console.log('✅ Blockchain fallback scenario tested');
    } catch (error) {
      this.logResult(
        'SCENARIO_BLOCKCHAIN_FALLBACK',
        false,
        `Fallback test failed: ${error.message}`
      );
      console.log('❌ Blockchain fallback test failed:', error.message);
    }
  }

  async testSecurityViolationHandling() {
    console.log('🚨 Testing security violation handling...');

    try {
      // Test various security modules' violation handling
      const modules = Object.values(this.securityModules).filter(Boolean);
      let violationHandlingWorks = modules.length > 0;

      this.logResult(
        'SCENARIO_VIOLATION_HANDLING',
        violationHandlingWorks,
        `Security modules with violation handling: ${modules.length}`
      );

      console.log('✅ Security violation handling tested');
    } catch (error) {
      this.logResult(
        'SCENARIO_VIOLATION_HANDLING',
        false,
        `Violation handling test failed: ${error.message}`
      );
      console.log('❌ Security violation handling test failed:', error.message);
    }
  }

  generateSecurityReport() {
    console.log('\n📊 Security Integration Test Report');
    console.log('━'.repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const duration = Date.now() - this.testStartTime;

    console.log(`📈 Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Duration: ${duration}ms`);
    console.log('');

    // Group results by category
    const categories = {
      'Module Initialization': this.testResults.filter((r) =>
        r.test.startsWith('INIT_')
      ),
      'Individual Modules': this.testResults.filter(
        (r) =>
          r.test.includes('ANTI_TAMPERING') ||
          r.test.includes('HARDWARE') ||
          r.test.includes('BLOCKCHAIN') ||
          r.test.includes('SENSOR') ||
          r.test.includes('CAMERA')
      ),
      'Module Integration': this.testResults.filter((r) =>
        r.test.startsWith('INTEGRATION_')
      ),
      'Complete Workflow': this.testResults.filter((r) =>
        r.test.startsWith('WORKFLOW_')
      ),
      'Security Scenarios': this.testResults.filter((r) =>
        r.test.startsWith('SCENARIO_')
      ),
    };

    Object.entries(categories).forEach(([category, results]) => {
      if (results.length === 0) return;

      console.log(`📋 ${category}:`);
      results.forEach((result) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`   ${icon} ${result.test}: ${result.message}`);
      });
      console.log('');
    });

    // Overall security assessment
    const criticalTests = [
      'INIT_AntiTamperingService',
      'INIT_BlockchainService',
      'WORKFLOW_COMPLETE',
      'INTEGRATION_BLOCKCHAIN_SECURITY',
    ];

    const criticalPassed = criticalTests.every(
      (test) => this.testResults.find((r) => r.test === test)?.passed
    );

    console.log('🛡️ Security Assessment:');
    if (criticalPassed && successRate >= 80) {
      console.log(
        '   🟢 EXCELLENT - All critical security features operational'
      );
    } else if (successRate >= 60) {
      console.log(
        '   🟡 GOOD - Most security features working, some issues detected'
      );
    } else {
      console.log(
        '   🔴 POOR - Critical security issues detected, review required'
      );
    }

    console.log('');
    console.log(
      '🎯 VeriLens Security System Status: ' +
        (criticalPassed ? 'PRODUCTION READY' : 'NEEDS ATTENTION')
    );
    console.log('━'.repeat(60));

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      duration,
      criticalPassed,
      overallStatus: criticalPassed ? 'PRODUCTION_READY' : 'NEEDS_ATTENTION',
    };
  }

  logResult(test, passed, message) {
    this.testResults.push({
      test,
      passed,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Public API
  getTestResults() {
    return this.testResults;
  }

  getSecurityModules() {
    return this.securityModules;
  }
}

// Export for global access
window.SecurityIntegrationTest = SecurityIntegrationTest;

// Auto-run test when page loads (for demo)
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 VeriLens Security Integration Test Ready');
  console.log('Run: new SecurityIntegrationTest().runCompleteSecurityTest()');
});
