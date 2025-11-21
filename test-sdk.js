const path = require('path');
const fs = require('fs');

// Import the built SDK components
const {
  CryptoHashService,
  ExifMetadataExtractor,
  LocalBlockchainSigner,
} = require('./dist/sdk');

async function testSDK() {
  console.log('🚀 Testing VeriLens SDK Components...\n');

  try {
    // Test 1: Crypto Hash Service
    console.log('1. Testing Crypto Hash Service...');
    const hashService = new CryptoHashService();
    const testData = 'Hello VeriLens!';
    const hashResult = await hashService.hashPayload(testData);
    console.log('✅ Hash Result:', {
      algorithm: hashResult.algorithm,
      digest: hashResult.digest.substring(0, 20) + '...',
      encoding: hashResult.encoding,
    });

    // Test 2: Blockchain Signer
    console.log('\n2. Testing Local Blockchain Signer...');
    const signer = new LocalBlockchainSigner({
      chainId: 'verilens-testnet',
      signerId: 'demo-signer',
    });

    const signature = await signer.signPayload(
      hashResult.digest,
      'verilens-testnet'
    );
    console.log('✅ Signature:', {
      chainId: signature.chainId,
      signerId: signature.signerId,
      signature: signature.signature.substring(0, 20) + '...',
    });

    // Test 3: Create a sample image buffer for metadata extraction
    console.log('\n3. Testing Metadata Extraction...');

    // Create a minimal JPEG header for testing
    const jpegHeader = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9,
    ]);

    const metadataExtractor = new ExifMetadataExtractor();

    try {
      const metadata = await metadataExtractor.extractMetadata(jpegHeader);
      console.log('✅ Metadata extracted (sample data):', metadata);
    } catch (error) {
      console.log(
        'ℹ️  No EXIF data in test buffer (expected for minimal JPEG)'
      );
    }

    console.log('\n🎉 SDK Components Test Complete!');
    console.log('\n📖 Next Steps:');
    console.log('- Add real image files to test metadata extraction');
    console.log(
      '- Integrate with React Native using react-native-fs for file access'
    );
    console.log('- Use camera APIs to capture images with metadata');
    console.log('- Deploy verification pipeline to cloud endpoint');
  } catch (error) {
    console.error('❌ SDK Test Failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testSDK();
