'use strict';

/**
 * This example demonstrates how the VeriLens SDK components could be composed in a Node runtime.
 * Replace relative imports with the published package name once available.
 */
const {
  VeriLensSdk,
  NodeFileImageCapture,
  ExifMetadataExtractor,
  LocalBlockchainSigner,
} = require('..');

async function run() {
  const sdk = new VeriLensSdk({
    captureDriver: new NodeFileImageCapture({
      defaultSourceUri: process.env.VERILENS_SAMPLE_IMAGE ?? './fixtures/sample.jpg',
    }),
    metadataExtractors: [new ExifMetadataExtractor()],
    blockchainSigner: new LocalBlockchainSigner({
      chainId: 'verilens-testnet',
      signerId: 'demo-signer',
    }),
  });

  sdk.registerStage({
    id: 'placeholder-stage',
    description: 'Demonstrate stage registration with minimal logic.',
    async execute() {
      return {
        stageId: 'placeholder-stage',
        success: true,
        summary: 'Stage execution not implemented yet.',
        details: { note: 'Replace with actual verification logic.' },
      };
    },
  });

  await sdk.initializeCapture({ camera: 'rear' });
  const capture = await sdk.captureManager.captureImage({ resolution: '1080x1080' });
  const metadata = await sdk.metadataService.extractMetadata(capture);
  const hash = await sdk.hashService.hashPayload(capture.bytes ?? capture.uri);

  console.log('Metadata snapshot:', metadata);
  console.log('Hash digest:', hash);

  try {
    const signed = await sdk.blockchainClient.signPayload(hash.digest, 'verilens-testnet');
    console.log('Signature:', signed);
  } catch (error) {
    console.warn('Signing skipped in placeholder implementation:', error.message);
  }

  const report = await sdk.runVerification({
    image: capture,
    metadata,
    expectedHash: hash.digest,
  });

  console.log('Verification report:', report);
}

run().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
