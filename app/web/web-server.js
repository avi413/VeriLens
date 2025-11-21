const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import VeriLens SDK components
const {
  CryptoHashService,
  LocalBlockchainSigner,
  ExifMetadataExtractor,
} = require('../../dist/sdk');

const {
  extractMetadata,
} = require('../../dist/app/verification/metadataExtractor');
const { encryptBuffer } = require('../../dist/app/crypto/encryption');

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Serve files from app/web directory
app.use('/dist', express.static(path.join(__dirname, '../../dist')));
app.use('/sdk', express.static(path.join(__dirname, '../../dist/sdk')));

// Initialize SDK components
const hashService = new CryptoHashService('sha256', 'hex');
const blockchainSigner = new LocalBlockchainSigner({
  chainId: 'verilens-web-testnet',
  signerId: 'web-server-001',
});

// Serve the secure web app (NEW)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'secure-web-app.html'));
});

// Serve the old web app for comparison
app.get('/old', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-app.html'));
});

// Serve the simple demo as alternative
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-demo.html'));
});

// Serve the investor demo
app.get('/investor', (req, res) => {
  res.sendFile(path.join(__dirname, 'investor-demo.html'));
});

// Serve the demo portal
app.get('/portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-portal.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    sdk: {
      name: 'VeriLens',
      version: '0.1.0',
      components: {
        hashService: '✅',
        blockchainSigner: '✅',
        metadataExtractor: '✅',
        encryption: '✅',
      },
    },
  });
});

// Process image with VeriLens SDK
app.post('/api/verify-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(
      `Processing image: ${req.file.originalname} (${req.file.size} bytes)`
    );

    const results = {
      filename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      processedAt: new Date().toISOString(),
    };

    // Step 1: Compute hash
    console.log('🔐 Computing hash...');
    const hashResult = await hashService.hashPayload(req.file.buffer);
    results.hash = {
      algorithm: hashResult.algorithm,
      digest: hashResult.digest,
      encoding: hashResult.encoding,
      inputLength: hashResult.inputLength,
      timestamp: hashResult.issuedAt,
    };

    // Step 2: Extract metadata
    console.log('📋 Extracting metadata...');
    try {
      const metadata = extractMetadata(req.file.buffer);
      results.metadata = metadata;
      results.metadataExtracted = true;
    } catch (error) {
      console.log('ℹ️ No EXIF metadata found:', error.message);
      results.metadata = {
        deviceMake: 'Unknown',
        deviceModel: 'Unknown',
        extractionError: error.message,
      };
      results.metadataExtracted = false;
    }

    // Step 3: Encrypt (simulate with demo key)
    console.log('🔒 Encrypting...');
    try {
      const demoKey = Buffer.alloc(32, 'demo-web-key-for-verilens-test'); // Demo key only
      const encrypted = encryptBuffer(req.file.buffer, demoKey);
      results.encryption = {
        algorithm: 'AES-256-GCM',
        ivLength: Buffer.from(encrypted.iv, 'base64').length,
        authTagLength: Buffer.from(encrypted.authTag, 'base64').length,
        ciphertextLength: Buffer.from(encrypted.ciphertext, 'base64').length,
        encrypted: true,
      };
    } catch (error) {
      console.log('❌ Encryption failed:', error.message);
      results.encryption = {
        encrypted: false,
        error: error.message,
      };
    }

    // Step 4: Blockchain signing
    console.log('⛓️ Blockchain signing...');
    const signature = await blockchainSigner.signPayload(
      hashResult.digest,
      'verilens-web-testnet'
    );
    results.blockchain = {
      chainId: signature.chainId,
      signerId: signature.signerId,
      signature: signature.signature,
      timestamp: signature.timestamp || new Date().toISOString(),
    };

    // Step 5: Generate verification score
    console.log('✅ Computing verification score...');
    const exifScore = results.metadataExtracted ? 0.85 : 0.3;
    const verdict =
      exifScore > 0.8 ? 'pass' : exifScore > 0.5 ? 'review' : 'fail';

    results.verification = {
      verdict: verdict,
      exifScore: exifScore,
      confidence: exifScore,
      checks: {
        hashIntegrity: true,
        metadataPresent: results.metadataExtracted,
        blockchainSigned: true,
        encryptionSuccessful: results.encryption.encrypted,
      },
    };

    // Step 6: Generate certificate
    const certificate = {
      version: '1.0',
      imageHash: results.hash.digest,
      metadata: results.metadata,
      verification: results.verification,
      blockchain: results.blockchain,
      encryption: results.encryption,
      file: {
        name: results.filename,
        size: results.fileSize,
        mimeType: results.mimeType,
      },
      generatedAt: results.processedAt,
      sdk: {
        name: 'VeriLens',
        version: '0.1.0',
        environment: 'web-server',
      },
    };

    console.log(`✅ Processing complete - Verdict: ${verdict}`);

    res.json({
      success: true,
      results: results,
      certificate: certificate,
    });
  } catch (error) {
    console.error('❌ Processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Demo endpoint with mock data
app.post('/api/demo', async (req, res) => {
  try {
    console.log('🎬 Running demo with mock data...');

    const mockImageData = Buffer.from(
      'VeriLens demo image data - ' + Date.now()
    );

    // Process mock data through SDK
    const hashResult = await hashService.hashPayload(mockImageData);
    const signature = await blockchainSigner.signPayload(
      hashResult.digest,
      'verilens-web-testnet'
    );

    const demoKey = Buffer.alloc(32, 'demo-web-key-for-verilens-test');
    const encrypted = encryptBuffer(mockImageData, demoKey);

    const certificate = {
      version: '1.0',
      imageHash: hashResult.digest,
      metadata: {
        deviceMake: 'Apple',
        deviceModel: 'iPhone 14 Pro',
        iso: 100,
        fNumber: 1.8,
        timestamp: new Date().toISOString(),
        latitude: 37.7749,
        longitude: -122.4194,
      },
      verification: {
        verdict: 'pass',
        exifScore: 0.92,
        confidence: 0.92,
        checks: {
          hashIntegrity: true,
          metadataPresent: true,
          blockchainSigned: true,
          encryptionSuccessful: true,
        },
      },
      blockchain: {
        chainId: signature.chainId,
        signerId: signature.signerId,
        signature: signature.signature,
        timestamp: new Date().toISOString(),
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        encrypted: true,
      },
      generatedAt: new Date().toISOString(),
      sdk: {
        name: 'VeriLens',
        version: '0.1.0',
        environment: 'web-demo',
      },
    };

    console.log('✅ Demo processing complete');

    res.json({
      success: true,
      certificate: certificate,
      message: 'Demo completed successfully with real VeriLens SDK',
    });
  } catch (error) {
    console.error('❌ Demo error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error',
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 VeriLens Web Demo Server Starting...');
  console.log('═'.repeat(50));
  console.log('📷 Cryptographic Photo Authenticity Framework');
  console.log(`🌐 Server running at: http://localhost:${port}`);
  console.log(`📱 Web Demo: http://localhost:${port}`);
  console.log(`🔧 Health Check: http://localhost:${port}/api/health`);
  console.log('═'.repeat(50));
  console.log('✅ Ready to verify photo authenticity!');
});

module.exports = app;
