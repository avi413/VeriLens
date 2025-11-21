/**
 * VeriLens Anti-Tampering Security System
 * Implements code integrity checks, obfuscation, and runtime security validations
 */

class AntiTamperingService {
  constructor() {
    this.integrityChecks = new Map();
    this.originalHashes = new Map();
    this.tamperingDetected = false;
    this.securityLevel = 'high';
    this.monitoringActive = false;

    this.init();
  }

  async init() {
    console.log('🛡️ Initializing Anti-Tampering System...');

    // Initialize integrity checks
    await this.setupIntegrityChecks();

    // Start runtime monitoring
    this.startRuntimeMonitoring();

    // Setup code obfuscation detection
    this.setupObfuscationDetection();

    // Monitor console access
    this.monitorConsoleAccess();

    // Setup timing attack protection
    this.setupTimingProtection();

    console.log(
      '🔒 Anti-tampering system active - Security Level:',
      this.securityLevel
    );
  }

  async setupIntegrityChecks() {
    // Get all critical functions and create checksums
    const criticalFunctions = [
      'CameraApp.prototype.capturePhoto',
      'VerificationService.processPhoto',
      'VerificationService.generateHash',
      'HardwareAttestationService.prototype.createDeviceAttestation',
      'BlockchainService.prototype.submitImageHash',
    ];

    for (const funcPath of criticalFunctions) {
      try {
        const func = this.getFunctionByPath(funcPath);
        if (func) {
          const funcString = func.toString();
          const hash = await this.calculateHash(funcString);

          this.originalHashes.set(funcPath, hash);
          this.integrityChecks.set(funcPath, {
            originalHash: hash,
            lastCheck: Date.now(),
            checkCount: 0,
            tampered: false,
          });
        }
      } catch (error) {
        console.warn('Failed to setup integrity check for:', funcPath);
      }
    }

    console.log(
      '🔍 Integrity checks setup for',
      this.integrityChecks.size,
      'functions'
    );
  }

  async verifyCodeIntegrity() {
    let tamperingDetected = false;
    const results = {};

    for (const [funcPath, check] of this.integrityChecks.entries()) {
      try {
        const func = this.getFunctionByPath(funcPath);
        if (func) {
          const currentHash = await this.calculateHash(func.toString());
          const isIntact = currentHash === check.originalHash;

          results[funcPath] = {
            intact: isIntact,
            originalHash: check.originalHash.substring(0, 16) + '...',
            currentHash: currentHash.substring(0, 16) + '...',
            lastCheck: new Date().toISOString(),
          };

          if (!isIntact) {
            tamperingDetected = true;
            check.tampered = true;
            console.error('🚨 TAMPERING DETECTED in function:', funcPath);
            this.handleTamperingDetection(
              funcPath,
              check.originalHash,
              currentHash
            );
          }

          check.checkCount++;
          check.lastCheck = Date.now();
        }
      } catch (error) {
        console.error('Integrity check failed for:', funcPath, error);
        results[funcPath] = { error: error.message };
      }
    }

    this.tamperingDetected = tamperingDetected;

    return {
      overallIntegrity: !tamperingDetected,
      tamperingDetected,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  startRuntimeMonitoring() {
    if (this.monitoringActive) return;

    this.monitoringActive = true;

    // Periodic integrity checks
    setInterval(() => {
      this.verifyCodeIntegrity();
    }, 30000); // Check every 30 seconds

    // Monitor for debugger
    setInterval(() => {
      this.detectDebugger();
    }, 1000);

    // Monitor DOM modifications on critical elements
    this.monitorDOMChanges();

    // Monitor global variable modifications
    this.monitorGlobalVariables();

    console.log('👁️ Runtime monitoring started');
  }

  detectDebugger() {
    const start = Date.now();

    // Debugger detection using timing
    debugger;

    const timeTaken = Date.now() - start;

    if (timeTaken > 100) {
      // If debugger paused execution
      console.warn('🚨 Debugger detected!');
      this.handleSecurityViolation('debugger_detected', { timeTaken });
      return true;
    }

    // Check for DevTools
    if (this.detectDevTools()) {
      console.warn('🚨 Developer tools detected!');
      this.handleSecurityViolation('devtools_detected');
      return true;
    }

    return false;
  }

  detectDevTools() {
    // Multiple DevTools detection methods
    let devtools = false;

    // Method 1: Window size difference
    const threshold = 160;
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      devtools = true;
    }

    // Method 2: Console detection
    if (window.console && typeof window.console.log === 'function') {
      const originalLog = window.console.log;

      Object.defineProperty(window.console, 'log', {
        get: function () {
          devtools = true;
          return originalLog;
        },
      });
    }

    // Method 3: Firebug detection
    if (window.console && window.console.firebug) {
      devtools = true;
    }

    return devtools;
  }

  monitorDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              // Check for suspicious script injections
              if (node.tagName === 'SCRIPT') {
                console.warn(
                  '🚨 Script injection detected:',
                  node.src || node.textContent
                );
                this.handleSecurityViolation('script_injection', {
                  src: node.src,
                  content: node.textContent?.substring(0, 100),
                });
              }

              // Check for external frame injections
              if (node.tagName === 'IFRAME') {
                console.warn('🚨 Iframe injection detected:', node.src);
                this.handleSecurityViolation('iframe_injection', {
                  src: node.src,
                });
              }
            }
          });
        }

        // Monitor attribute changes on critical elements
        if (mutation.type === 'attributes' && mutation.target.id) {
          const criticalIds = ['camera', 'canvas', 'captured-image'];
          if (criticalIds.includes(mutation.target.id)) {
            console.warn(
              '🚨 Critical element modified:',
              mutation.target.id,
              mutation.attributeName
            );
          }
        }
      });
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
    });
  }

  monitorGlobalVariables() {
    const criticalGlobals = [
      'CameraApp',
      'VerificationService',
      'HardwareAttestationService',
      'BlockchainService',
    ];

    for (const globalName of criticalGlobals) {
      if (window[globalName]) {
        this.protectGlobalVariable(globalName);
      }
    }
  }

  protectGlobalVariable(varName) {
    const originalValue = window[varName];
    let currentValue = originalValue;

    Object.defineProperty(window, varName, {
      get: function () {
        return currentValue;
      },
      set: function (newValue) {
        console.warn('🚨 Attempt to modify global variable:', varName);

        // Allow setting once (for initialization), but detect subsequent changes
        if (currentValue !== originalValue) {
          console.error(
            '🚨 TAMPERING: Global variable',
            varName,
            'modified multiple times'
          );
          this.handleSecurityViolation('global_modification', {
            variable: varName,
            originalType: typeof originalValue,
            newType: typeof newValue,
          });
        }

        currentValue = newValue;
      },
      configurable: false,
      enumerable: true,
    });
  }

  setupObfuscationDetection() {
    // Detect if our code has been obfuscated or modified
    const codeMarkers = [
      'VeriLens Camera Module',
      'Hardware Attestation',
      'Blockchain Service',
      'Device Sensor Service',
      'Anti-Tampering Security',
    ];

    let markerCount = 0;
    const scripts = document.getElementsByTagName('script');

    for (const script of scripts) {
      const content = script.textContent || '';
      for (const marker of codeMarkers) {
        if (content.includes(marker)) {
          markerCount++;
        }
      }
    }

    if (markerCount < codeMarkers.length * 0.5) {
      console.warn('🚨 Code obfuscation or removal detected');
      this.handleSecurityViolation('code_obfuscation', {
        expectedMarkers: codeMarkers.length,
        foundMarkers: markerCount,
      });
    }
  }

  monitorConsoleAccess() {
    const self = this;

    // Override console methods to detect tampering attempts
    const consoleMethods = ['log', 'warn', 'error', 'debug', 'info'];

    consoleMethods.forEach((method) => {
      const original = console[method];

      console[method] = function (...args) {
        // Detect attempts to access sensitive data
        const message = args.join(' ').toLowerCase();

        if (
          message.includes('verilens') ||
          message.includes('hash') ||
          message.includes('attestation')
        ) {
          self.handleSecurityViolation('console_access', {
            method,
            message: message.substring(0, 100),
          });
        }

        return original.apply(console, args);
      };
    });
  }

  setupTimingProtection() {
    // Protect against timing attacks by adding random delays
    const protectFunction = (obj, methodName) => {
      if (obj && typeof obj[methodName] === 'function') {
        const original = obj[methodName];

        obj[methodName] = async function (...args) {
          // Add random delay to prevent timing analysis
          const delay = Math.random() * 100 + 50; // 50-150ms random delay
          await new Promise((resolve) => setTimeout(resolve, delay));

          return original.apply(this, args);
        };
      }
    };

    // Protect critical methods
    if (window.crypto && window.crypto.subtle) {
      protectFunction(window.crypto.subtle, 'digest');
      protectFunction(window.crypto.subtle, 'importKey');
      protectFunction(window.crypto.subtle, 'sign');
    }
  }

  handleTamperingDetection(funcPath, originalHash, currentHash) {
    const violation = {
      type: 'code_tampering',
      function: funcPath,
      originalHash: originalHash.substring(0, 16),
      currentHash: currentHash.substring(0, 16),
      timestamp: new Date().toISOString(),
      severity: 'critical',
    };

    this.handleSecurityViolation('code_tampering', violation);
  }

  handleSecurityViolation(violationType, details = {}) {
    const violation = {
      type: violationType,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('🚨 SECURITY VIOLATION:', violation);

    // Store violation
    this.storeSecurityViolation(violation);

    // Take protective action based on violation type
    switch (violationType) {
      case 'code_tampering':
      case 'debugger_detected':
      case 'devtools_detected':
        this.enterLockdownMode();
        break;

      case 'script_injection':
      case 'iframe_injection':
        this.blockSuspiciousContent();
        break;

      case 'console_access':
        this.obfuscateConsoleOutput();
        break;

      default:
        console.warn('Unknown violation type:', violationType);
    }

    // Report to server if available
    this.reportViolationToServer(violation);
  }

  enterLockdownMode() {
    console.warn('🔒 Entering security lockdown mode');

    // Disable critical functions
    this.disableCriticalFunctions();

    // Show security warning
    this.showSecurityWarning();

    // Clear sensitive data
    this.clearSensitiveData();
  }

  disableCriticalFunctions() {
    const functionsToDisable = [
      'capturePhoto',
      'processPhoto',
      'submitImageHash',
      'createDeviceAttestation',
    ];

    functionsToDisable.forEach((funcName) => {
      if (window[funcName]) {
        window[funcName] = () => {
          throw new Error('Function disabled due to security violation');
        };
      }
    });
  }

  showSecurityWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 0, 0.9);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: Arial, sans-serif;
    `;

    warningDiv.innerHTML = `
      <h1>🚨 SECURITY VIOLATION DETECTED</h1>
      <p>Unauthorized tampering attempts have been detected.</p>
      <p>The application has been disabled for security reasons.</p>
      <p>Please refresh the page and avoid using developer tools.</p>
    `;

    document.body.appendChild(warningDiv);
  }

  clearSensitiveData() {
    // Clear any captured images or verification data
    if (window.cameraAppInstance) {
      window.cameraAppInstance.capturedImage = null;
      window.cameraAppInstance.verificationResult = null;
    }

    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();
  }

  blockSuspiciousContent() {
    // Remove any suspicious scripts or iframes
    const suspiciousElements = document.querySelectorAll(
      'script[src*="malicious"], iframe[src*="suspicious"]'
    );
    suspiciousElements.forEach((element) => element.remove());
  }

  obfuscateConsoleOutput() {
    // Override console to prevent sensitive data extraction
    const methods = ['log', 'warn', 'error', 'info', 'debug'];

    methods.forEach((method) => {
      console[method] = () => {
        // Do nothing - suppress output
      };
    });
  }

  storeSecurityViolation(violation) {
    try {
      const violations = JSON.parse(
        localStorage.getItem('verilens_security_violations') || '[]'
      );
      violations.push(violation);

      // Keep only last 50 violations
      if (violations.length > 50) {
        violations.splice(0, violations.length - 50);
      }

      localStorage.setItem(
        'verilens_security_violations',
        JSON.stringify(violations)
      );
    } catch (error) {
      console.error('Failed to store security violation:', error);
    }
  }

  async reportViolationToServer(violation) {
    // Rate limiting to prevent spam
    const now = Date.now();
    if (!this.lastReportTime) this.lastReportTime = 0;

    if (now - this.lastReportTime < 5000) {
      // 5 second cooldown
      return;
    }

    this.lastReportTime = now;

    try {
      await fetch('/api/security-violation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation),
      });
    } catch (error) {
      // Silent fail for test environment
      if (location.hostname !== 'localhost') {
        console.warn('Failed to report violation to server:', error);
      }
    }
  }

  // Utility methods
  getFunctionByPath(path) {
    const parts = path.split('.');
    let current = window;

    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }

    return typeof current === 'function' ? current : null;
  }

  async calculateHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Public API
  getSecurityStatus() {
    return {
      tamperingDetected: this.tamperingDetected,
      securityLevel: this.securityLevel,
      monitoringActive: this.monitoringActive,
      integrityChecks: this.integrityChecks.size,
      violationCount: this.getViolationCount(),
    };
  }

  getViolationCount() {
    try {
      const violations = JSON.parse(
        localStorage.getItem('verilens_security_violations') || '[]'
      );
      return violations.length;
    } catch (error) {
      return 0;
    }
  }

  async performSecurityScan() {
    const results = {
      codeIntegrity: await this.verifyCodeIntegrity(),
      debuggerDetection: this.detectDebugger(),
      devToolsDetection: this.detectDevTools(),
      securityStatus: this.getSecurityStatus(),
      timestamp: new Date().toISOString(),
    };

    return results;
  }

  // Additional API methods for testing
  startDOMMonitoring() {
    if (this.domObserver) {
      console.log('🔍 DOM monitoring already active');
      return true;
    }

    this.setupDOMMonitoring();
    return !!this.domObserver;
  }

  detectAvailableSensors() {
    // This method exists for testing compatibility
    return {
      domMonitoring: !!this.domObserver,
      integrityChecks: this.integrityStatus
        ? this.integrityStatus.checksEnabled
        : false,
      debuggerDetection: true,
      functionProtection: this.protectedFunctions
        ? this.protectedFunctions.size > 0
        : false,
    };
  }

  // Public API methods
  getTamperingStatus() {
    return {
      tamperingDetected: this.tamperingDetected,
      violationCount: this.violationCount,
      lastViolation: this.lastViolation,
      monitoringActive: this.isMonitoring,
      integrityChecks: this.integrityStatus,
      protectedFunctions: this.protectedFunctions
        ? this.protectedFunctions.size
        : 0,
    };
  }
}

// Initialize anti-tampering system immediately
const antiTamperingService = new AntiTamperingService();

// Export for global access
window.AntiTamperingService = AntiTamperingService;
window.antiTamperingService = antiTamperingService;
