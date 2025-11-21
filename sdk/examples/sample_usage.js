'use strict';

/**
 * This example demonstrates how the VeriLens SDK components could be composed in a Node runtime.
 * Replace relative imports with the published package name once available.
 */
const { ImageCaptureManager } = require('../core/ImageCaptureManager');
const { MetadataService } = require('../core/MetadataService');
const { CryptoHashService } = require('../core/CryptoHashService');
const { BlockchainClient } = require('../core/BlockchainClient');
const { VerificationEngine } = require('../core/VerificationEngine');

async function run() {
  const captureManager = new ImageCaptureManager();
  const metadataService = new MetadataService();
  const hashService = new CryptoHashService('sha256');
  const blockchainClient = new BlockchainClient({
    supportedChains: ['verilens-testnet'],
    defaultSignerId: 'demo-signer',
  });
  const verificationEngine = new VerificationEngine();

  verificationEngine.registerStage({
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

  await captureManager.initialize({ camera: 'rear' });
  const capture = await captureManager.captureImage({ resolution: '1080x1080' });
  const metadata = await metadataService.extractMetadata(capture);
  const hash = await hashService.hashPayload(capture.bytes ?? capture.uri);

  console.log('Metadata snapshot:', metadata);
  console.log('Hash digest:', hash);

  try {
    const signed = await blockchainClient.signPayload(hash.digest, 'verilens-testnet');
    console.log('Signature:', signed);
  } catch (error) {
    console.warn('Signing skipped in placeholder implementation:', error.message);
  }

  const report = await verificationEngine.runVerification({
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
