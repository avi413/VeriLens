// Import verification components
const {
  extractMetadata,
} = require('./dist/app/verification/metadataExtractor');
const { runVerification } = require('./dist/app/verification/pipeline');

async function testVerificationPipeline() {
  console.log('🔍 Testing VeriLens Verification Pipeline...\n');

  try {
    // Create a test image buffer (minimal JPEG)
    const testImageBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9,
    ]);

    console.log('1. Testing Metadata Extraction...');
    const metadata = extractMetadata(testImageBuffer);
    console.log('✅ Metadata Result:', metadata);

    console.log('\n2. Testing Verification Pipeline...');
    const verificationResult = await runVerification({
      imageBuffer: testImageBuffer,
      depthFrame: null, // No depth data for test
      expectedDeviceId: 'test-device', // Test device ID
    });

    console.log('✅ Verification Result:', {
      verdict: verificationResult.verdict,
      exifScore: verificationResult.exifScore,
      depthScore: verificationResult.depthScore,
      checksum: verificationResult.checksum?.substring(0, 16) + '...',
    });

    console.log('\n🎯 Verification Pipeline Test Complete!');
  } catch (error) {
    console.error('❌ Verification Test Failed:', error.message);
  }
}

testVerificationPipeline();
