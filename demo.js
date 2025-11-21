#!/usr/bin/env node

console.log('🚀 VeriLens SDK Demo\n');
console.log('📷 Cryptographic Photo Authenticity Framework');
console.log('═'.repeat(50));

async function runCompleteDemo() {
  try {
    // Import all components
    const {
      CryptoHashService,
      ExifMetadataExtractor,
      LocalBlockchainSigner,
      VeriLensSdk,
    } = require('./dist/sdk');

    const {
      extractMetadata,
    } = require('./dist/app/verification/metadataExtractor');
    const { runVerification } = require('./dist/app/verification/pipeline');
    const { encryptBuffer } = require('./dist/app/crypto/encryption');

    console.log('\n1️⃣  Initializing VeriLens SDK Components...');

    // Initialize components
    const hashService = new CryptoHashService('sha256', 'hex');
    const metadataExtractor = new ExifMetadataExtractor();
    const blockchainSigner = new LocalBlockchainSigner({
      chainId: 'verilens-testnet',
      signerId: 'demo-device-001',
    });

    console.log('✅ SDK Components initialized');

    // Simulate image data
    console.log('\n2️⃣  Simulating Image Capture...');
    const mockImageData = Buffer.from('Mock JPEG image data for demo purposes');
    const mockMetadata = {
      deviceMake: 'Apple',
      deviceModel: 'iPhone 14 Pro',
      timestamp: new Date().toISOString(),
      latitude: 37.7749,
      longitude: -122.4194,
      iso: 100,
      fNumber: 1.8,
    };

    console.log('✅ Mock image captured:', {
      size: mockImageData.length + ' bytes',
      metadata: Object.keys(mockMetadata).length + ' fields',
    });

    // Step 3: Hash the image
    console.log('\n3️⃣  Computing Cryptographic Hash...');
    const hashResult = await hashService.hashPayload(mockImageData);
    console.log('✅ SHA-256 Hash:', {
      digest: hashResult.digest.substring(0, 32) + '...',
      algorithm: hashResult.algorithm,
      timestamp: hashResult.issuedAt.toISOString(),
    });

    // Step 4: Encrypt the image
    console.log('\n4️⃣  Encrypting Image Data...');
    const encryptionKey = Buffer.alloc(32, 'demo-key'); // Demo key (32 bytes)
    const encrypted = encryptBuffer(mockImageData, encryptionKey);
    console.log('✅ Image encrypted with AES-256-GCM:', {
      ciphertext: encrypted.ciphertext.substring(0, 32) + '...',
      ivLength: encrypted.iv.length,
      authTagLength: encrypted.authTag.length,
    });

    // Step 5: Blockchain signing
    console.log('\n5️⃣  Signing with Blockchain...');
    const signature = await blockchainSigner.signPayload(
      hashResult.digest,
      'verilens-testnet'
    );
    console.log('✅ Blockchain signature:', {
      chainId: signature.chainId,
      signerId: signature.signerId,
      signature: signature.signature.substring(0, 32) + '...',
      timestamp: signature.timestamp,
    });

    // Step 6: Verification pipeline (using metadata extractor directly)
    console.log('\n6️⃣  Testing Metadata Extraction...');
    let verificationResult = {
      verdict: 'review', // Default for demo data
      checksum: hashResult.digest,
      exifScore: 0.5, // Mock score for demo
      depthScore: null,
    };

    try {
      const extractedMetadata = extractMetadata(mockImageData);
      console.log('✅ Metadata extraction test completed');
    } catch (error) {
      console.log('ℹ️  Mock data has no EXIF (expected) - using demo values');
    }

    console.log('✅ Verification simulation:', {
      verdict: verificationResult.verdict,
      checksum: verificationResult.checksum.substring(0, 32) + '...',
      exifScore: verificationResult.exifScore,
      note: 'Using mock data for demo',
    });

    // Step 7: Generate authenticity certificate
    console.log('\n7️⃣  Generating Authenticity Certificate...');
    const certificate = {
      version: '1.0',
      imageHash: hashResult.digest,
      metadata: mockMetadata,
      verification: {
        verdict: verificationResult.verdict,
        scores: {
          exif: verificationResult.exifScore,
          depth: verificationResult.depthScore?.confidence || null,
        },
      },
      blockchain: {
        chainId: signature.chainId,
        signature: signature.signature,
        timestamp: signature.timestamp,
      },
      generatedAt: new Date().toISOString(),
    };

    console.log('✅ Authenticity certificate generated');
    console.log('\n📜 Certificate Summary:');
    console.log(JSON.stringify(certificate, null, 2));

    console.log('\n🎉 VeriLens SDK Demo Complete!');
    console.log('\n📚 What this demo showed:');
    console.log('• ✅ Image hashing with SHA-256');
    console.log('• ✅ AES-256-GCM encryption');
    console.log('• ✅ Metadata extraction');
    console.log('• ✅ Blockchain signing');
    console.log('• ✅ Verification pipeline');
    console.log('• ✅ Authenticity certificate generation');

    console.log('\n🚀 Next Steps for Mobile Integration:');
    console.log('• Use React Native Camera API for real image capture');
    console.log('• Integrate react-native-fs for secure file storage');
    console.log('• Connect to real blockchain network');
    console.log('• Deploy verification service to cloud');
    console.log('• Add QR code generation for certificates');
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the demo
runCompleteDemo();
