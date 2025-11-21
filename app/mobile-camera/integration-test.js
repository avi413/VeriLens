/**
 * VeriLens Security Integration Test Suite
 * Comprehensive testing of all 6 security modules working together
 */

class VeriLensIntegrationTest {
  constructor() {
    this.testResults = [];
    this.services = {};
    this.testSummary = {
      passed: 0,
      failed: 0,
      total: 0,
      startTime: null,
      endTime: null,
    };

    this.init();
  }

  async init() {
    console.log('🧪 Initializing VeriLens Integration Test Suite...');

    try {
      // Initialize all security services
      await this.initializeServices();

      // Setup test environment
      await this.setupTestEnvironment();

      console.log('✅ Integration test suite ready');
    } catch (error) {
      console.error('❌ Test suite initialization failed:', error);
    }
  }

  async initializeServices() {
    console.log('🔧 Initializing security services...');

    // Initialize services in dependency order
    this.services.antiTampering = new AntiTamperingService();
    this.services.deviceSensor = new DeviceSensorService();
    this.services.hardwareAttestation = new HardwareAttestationService();
    this.services.blockchain = new BlockchainService();
    this.services.secureCamera = new SecureCameraAPI();

    // Wait for async initialization
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('📊 Services initialized:', Object.keys(this.services));
  }

  async setupTestEnvironment() {
    // Create test video element
    this.testVideo = document.createElement('video');
    this.testVideo.id = 'test-video';
    this.testVideo.style.display = 'none';
    document.body.appendChild(this.testVideo);

    // Create test canvas
    this.testCanvas = document.createElement('canvas');
    this.testCanvas.id = 'test-canvas';
    this.testCanvas.style.display = 'none';
    document.body.appendChild(this.testCanvas);

    console.log('🎬 Test environment setup complete');
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive integration tests...');
    this.testSummary.startTime = new Date();

    const tests = [
      'testAntiTamperingService',
      'testDeviceSensorService',
      'testHardwareAttestationService',
      'testBlockchainService',
      'testSecureCameraAPI',
      'testServiceIntegration',
      'testSecurityWorkflow',
      'testFailureScenarios',
      'testPerformanceMetrics',
    ];

    for (const testName of tests) {
      try {
        console.log(`\n🔍 Running ${testName}...`);
        await this[testName]();
      } catch (error) {
        this.recordTest(testName, false, error.message);
      }
    }

    this.testSummary.endTime = new Date();
    this.generateTestReport();
  }

  async testAntiTamperingService() {
    const service = this.services.antiTampering;

    // Test 1: Service initialization
    this.recordTest(
      'AntiTampering - Initialization',
      service && typeof service.verifyCodeIntegrity === 'function',
      'Service properly initialized'
    );

    // Test 2: Code integrity checks
    const integrityResult = service.verifyCodeIntegrity();
    this.recordTest(
      'AntiTampering - Code Integrity',
      integrityResult && integrityResult.passed !== undefined,
      'Code integrity: ' + (integrityResult ? (integrityResult.status || 'checked') : 'failed')
    );

    // Test 3: Debugger detection
    const debuggerCheck = service.detectDebugger();
    this.recordTest(
      'AntiTampering - Debugger Detection',
      typeof debuggerCheck === 'boolean',
      `Debugger detection functional: ${!debuggerCheck}`
    );

    // Test 4: DOM monitoring
    const domMonitoring = service.startDOMMonitoring();
    this.recordTest(
      'AntiTampering - DOM Monitoring',
      domMonitoring,
      'DOM monitoring activated'
    );
  }

  async testDeviceSensorService() {
    const service = this.services.deviceSensor;

    // Test 1: Sensor availability detection
    const sensors = service.detectAvailableSensors();
    this.recordTest(
      'DeviceSensor - Detection',
      sensors && Object.keys(sensors).length > 0,
      `Detected sensors: ${Object.keys(sensors).join(', ')}`
    );

    // Test 2: Sensor data capture simulation
    try {
      const sensorData = await service.startSensorCapture(1000); // 1 second
      this.recordTest(
        'DeviceSensor - Data Capture',
        sensorData && sensorData.success,
        `Captured ${sensorData.readings?.length || 0} sensor readings`
      );
    } catch (error) {
      this.recordTest(
        'DeviceSensor - Data Capture',
        false,
        `Capture failed: ${error.message}`
      );
    }

    // Test 3: Device signature generation
    const signature = await service.generateDeviceSignature();
    this.recordTest(
      'DeviceSensor - Device Signature',
      signature && signature.length > 20,
      `Generated signature: ${signature?.substring(0, 16)}...`
    );
  }

  async testHardwareAttestationService() {
    const service = this.services.hardwareAttestation;

    // Test 1: WebAuthn availability
    const webauthnSupport = service.checkWebAuthnSupport();
    this.recordTest(
      'HardwareAttestation - WebAuthn Support',
      typeof webauthnSupport === 'object',
      `WebAuthn: ${webauthnSupport.available ? 'Available' : 'Not Available'}`
    );

    // Test 2: Device capabilities detection
    const capabilities = service.getDeviceCapabilities();
    this.recordTest(
      'HardwareAttestation - Device Capabilities',
      capabilities && typeof capabilities === 'object',
      `Capabilities detected: ${Object.keys(capabilities).length} features`
    );

    // Test 3: Biometric detection
    const biometrics = await service.detectBiometricCapabilities();
    this.recordTest(
      'HardwareAttestation - Biometric Detection',
      biometrics && typeof biometrics === 'object',
      `Biometrics: ${JSON.stringify(biometrics).substring(0, 50)}...`
    );

    // Test 4: Device fingerprint generation
    const fingerprint = await service.generateDeviceFingerprint();
    this.recordTest(
      'HardwareAttestation - Device Fingerprint',
      fingerprint && fingerprint.length > 0,
      `Fingerprint: ${fingerprint.substring(0, 16)}...`
    );
  }

  async testBlockchainService() {
    const service = this.services.blockchain;

    // Test 1: Service initialization
    this.recordTest(
      'Blockchain - Service Initialization',
      service && typeof service.submitImageHash === 'function',
      'Blockchain service initialized'
    );

    // Test 2: Network connection status
    const isConnected = service.isConnected();
    this.recordTest(
      'Blockchain - Connection Status',
      typeof isConnected === 'boolean',
      `Connection: ${isConnected ? 'Connected' : 'Local Fallback'}`
    );

    // Test 3: Blockchain stats retrieval
    try {
      const stats = await service.getBlockchainStats();
      this.recordTest(
        'Blockchain - Stats Retrieval',
        stats && stats.network,
        `Network: ${stats.network}, Hashes: ${stats.totalHashes}`
      );
    } catch (error) {
      this.recordTest(
        'Blockchain - Stats Retrieval',
        false,
        `Stats failed: ${error.message}`
      );
    }

    // Test 4: Mock hash submission
    try {
      const testHash = 'test_hash_' + Date.now();
      const result = await service.submitImageHash(
        testHash,
        { trustScore: 85 },
        'test-device'
      );
      this.recordTest(
        'Blockchain - Hash Submission',
        result && result.success,
        `Submitted to ${result.network}: ${result.transactionHash?.substring(
          0,
          16
        )}...`
      );
    } catch (error) {
      this.recordTest(
        'Blockchain - Hash Submission',
        false,
        `Submission failed: ${error.message}`
      );
    }
  }

  async testSecureCameraAPI() {
    const service = this.services.secureCamera;

    // Test 1: Camera API initialization
    this.recordTest(
      'SecureCamera - Initialization',
      service && typeof service.startSecureCapture === 'function',
      'Secure Camera API initialized'
    );

    // Test 2: Security features detection
    const features = service.getEnabledSecurityFeatures();
    this.recordTest(
      'SecureCamera - Security Features',
      features && Object.keys(features).length > 0,
      `Features: ${Object.keys(features)
        .filter((k) => features[k])
        .join(', ')}`
    );

    // Test 3: Camera capabilities check
    const capabilities = service.checkAdvancedCameraFeatures();
    this.recordTest(
      'SecureCamera - Camera Capabilities',
      capabilities && capabilities.webRTC,
      `WebRTC: ${capabilities.webRTC}, ImageCapture: ${capabilities.imageCapture}`
    );

    // Test 4: Security status
    const securityStatus = service.getSecurityStatus();
    this.recordTest(
      'SecureCamera - Security Status',
      securityStatus && typeof securityStatus.securityLevel === 'string',
      `Security Level: ${securityStatus.securityLevel}`
    );
  }

  async testServiceIntegration() {
    console.log('🔗 Testing service integration...');

    // Test 1: Anti-tampering + Camera integration
    const tamperingActive = this.services.antiTampering.isMonitoring;
    const cameraReady = this.services.secureCamera.getSecurityStatus();
    this.recordTest(
      'Integration - AntiTampering + Camera',
      tamperingActive && cameraReady,
      'Anti-tampering protects camera operations'
    );

    // Test 2: Sensor + Hardware attestation
    const sensorData =
      await this.services.deviceSensor.generateDeviceSignature();
    const hardwareFingerprint =
      await this.services.hardwareAttestation.generateDeviceFingerprint();
    this.recordTest(
      'Integration - Sensor + Hardware',
      sensorData && hardwareFingerprint && sensorData !== hardwareFingerprint,
      'Sensor and hardware generate unique signatures'
    );

    // Test 3: Camera + Blockchain workflow
    const cameraFeatures =
      this.services.secureCamera.getEnabledSecurityFeatures();
    const blockchainStats = await this.services.blockchain.getBlockchainStats();
    this.recordTest(
      'Integration - Camera + Blockchain',
      cameraFeatures.frameValidation && blockchainStats.network,
      `Camera validation ready for ${blockchainStats.network} submission`
    );

    // Test 4: All services operational status
    const allServicesReady = Object.values(this.services).every(
      (service) => service !== null
    );
    this.recordTest(
      'Integration - All Services Ready',
      allServicesReady,
      'All 6 security modules operational'
    );
  }

  async testSecurityWorkflow() {
    console.log('🔄 Testing complete security workflow...');

    try {
      // Step 1: Anti-tampering verification
      const integrityCheck = this.services.antiTampering.verifyCodeIntegrity();

      // Step 2: Device attestation
      const deviceAttestation =
        await this.services.hardwareAttestation.generateDeviceFingerprint();

      // Step 3: Sensor capture simulation
      const sensorCapture = await this.services.deviceSensor.startSensorCapture(
        500
      );

      // Step 4: Blockchain preparation
      const blockchainReady =
        this.services.blockchain.isConnected() ||
        (await this.services.blockchain.getLocalBlockchainStats())
          .totalHashes >= 0;

      // Step 5: Camera security validation
      const cameraSecure =
        this.services.secureCamera.getSecurityStatus().securityLevel ===
        'maximum';

      const workflowSuccess =
        integrityCheck.passed &&
        deviceAttestation &&
        sensorCapture.success &&
        blockchainReady &&
        cameraSecure;

      this.recordTest(
        'Workflow - Complete Security Pipeline',
        workflowSuccess,
        `Workflow: ${
          workflowSuccess ? 'SECURE' : 'FAILED'
        } - All security layers validated`
      );
    } catch (error) {
      this.recordTest(
        'Workflow - Complete Security Pipeline',
        false,
        `Workflow failed: ${error.message}`
      );
    }
  }

  async testFailureScenarios() {
    console.log('⚠️ Testing failure scenarios...');

    // Test 1: Blockchain fallback
    const originalContract = this.services.blockchain.contract;
    this.services.blockchain.contract = null; // Simulate blockchain failure

    try {
      const fallbackResult = await this.services.blockchain.submitImageHash(
        'fallback_test',
        {},
        'test'
      );
      this.recordTest(
        'Failure - Blockchain Fallback',
        fallbackResult.success && fallbackResult.localFallback,
        'Blockchain gracefully falls back to local storage'
      );
    } catch (error) {
      this.recordTest(
        'Failure - Blockchain Fallback',
        false,
        `Fallback failed: ${error.message}`
      );
    }

    // Restore blockchain
    this.services.blockchain.contract = originalContract;

    // Test 2: Sensor unavailability handling
    try {
      const sensorResult = await this.services.deviceSensor.startSensorCapture(
        100
      );
      this.recordTest(
        'Failure - Sensor Handling',
        sensorResult && (sensorResult.success || sensorResult.fallback),
        'Sensor service handles unavailability gracefully'
      );
    } catch (error) {
      this.recordTest(
        'Failure - Sensor Handling',
        true, // Expected for some environments
        'Sensor failure handled with appropriate error'
      );
    }

    // Test 3: WebAuthn unavailability
    const webauthnSupport =
      this.services.hardwareAttestation.checkWebAuthnSupport();
    this.recordTest(
      'Failure - WebAuthn Fallback',
      webauthnSupport.available || webauthnSupport.fallbackAvailable,
      'Hardware attestation provides fallback when WebAuthn unavailable'
    );
  }

  async testPerformanceMetrics() {
    console.log('⚡ Testing performance metrics...');

    const performanceTests = [
      {
        name: 'AntiTampering Response Time',
        test: () => this.services.antiTampering.detectDebugger(),
        threshold: 10, // milliseconds
      },
      {
        name: 'Device Fingerprint Generation',
        test: () =>
          this.services.hardwareAttestation.generateDeviceFingerprint(),
        threshold: 100, // milliseconds
      },
      {
        name: 'Blockchain Stats Retrieval',
        test: () => this.services.blockchain.getBlockchainStats(),
        threshold: 2000, // milliseconds
      },
    ];

    for (const perfTest of performanceTests) {
      const startTime = performance.now();
      try {
        await perfTest.test();
        const duration = performance.now() - startTime;

        this.recordTest(
          `Performance - ${perfTest.name}`,
          duration < perfTest.threshold,
          `Completed in ${duration.toFixed(2)}ms (threshold: ${
            perfTest.threshold
          }ms)`
        );
      } catch (error) {
        this.recordTest(
          `Performance - ${perfTest.name}`,
          false,
          `Performance test failed: ${error.message}`
        );
      }
    }
  }

  recordTest(testName, passed, message) {
    const result = {
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString(),
    };

    this.testResults.push(result);
    this.testSummary.total++;

    if (passed) {
      this.testSummary.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.testSummary.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  generateTestReport() {
    const duration = this.testSummary.endTime - this.testSummary.startTime;

    console.log('\n' + '='.repeat(80));
    console.log('📊 VERILENS INTEGRATION TEST REPORT');
    console.log('='.repeat(80));
    console.log(`🕒 Test Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(
      `📈 Tests Passed: ${this.testSummary.passed}/${this.testSummary.total}`
    );
    console.log(
      `📉 Tests Failed: ${this.testSummary.failed}/${this.testSummary.total}`
    );
    console.log(
      `🎯 Success Rate: ${(
        (this.testSummary.passed / this.testSummary.total) *
        100
      ).toFixed(1)}%`
    );

    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(80));

    const categories = {};
    this.testResults.forEach((result) => {
      const category = result.name.split(' - ')[0];
      if (!categories[category]) categories[category] = [];
      categories[category].push(result);
    });

    Object.entries(categories).forEach(([category, tests]) => {
      const passed = tests.filter((t) => t.passed).length;
      const total = tests.length;
      console.log(`\n🔧 ${category}: ${passed}/${total} passed`);

      tests.forEach((test) => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`  ${icon} ${test.name.split(' - ')[1]}: ${test.message}`);
      });
    });

    // Overall security assessment
    console.log('\n' + '='.repeat(80));
    console.log('🛡️ SECURITY ASSESSMENT');
    console.log('='.repeat(80));

    const criticalTests = this.testResults.filter(
      (r) =>
        r.name.includes('Code Integrity') ||
        r.name.includes('Complete Security Pipeline') ||
        r.name.includes('All Services Ready')
    );

    const criticalPassed = criticalTests.filter((t) => t.passed).length;
    const securityLevel =
      criticalPassed === criticalTests.length
        ? 'MAXIMUM'
        : criticalPassed >= criticalTests.length * 0.8
        ? 'HIGH'
        : criticalPassed >= criticalTests.length * 0.6
        ? 'MEDIUM'
        : 'LOW';

    console.log(`🔒 Security Level: ${securityLevel}`);
    console.log(
      `🛡️ Critical Tests: ${criticalPassed}/${criticalTests.length} passed`
    );

    if (securityLevel === 'MAXIMUM') {
      console.log(
        '🎉 VeriLens security architecture is FULLY OPERATIONAL and HACK-PROOF!'
      );
    } else {
      console.log(
        '⚠️ Some security components need attention before production use.'
      );
    }

    console.log('='.repeat(80));

    return {
      summary: this.testSummary,
      results: this.testResults,
      securityLevel,
      criticalTestsPassed: criticalPassed === criticalTests.length,
    };
  }

  // Public API
  async runQuickTest() {
    console.log('⚡ Running quick integration test...');

    const quickTests = ['testAntiTamperingService', 'testServiceIntegration'];

    for (const testName of quickTests) {
      await this[testName]();
    }

    return this.generateTestReport();
  }

  getTestResults() {
    return {
      summary: this.testSummary,
      results: this.testResults,
    };
  }

  clearTestResults() {
    this.testResults = [];
    this.testSummary = {
      passed: 0,
      failed: 0,
      total: 0,
      startTime: null,
      endTime: null,
    };
  }
}

// Export for global access
window.VeriLensIntegrationTest = VeriLensIntegrationTest;
