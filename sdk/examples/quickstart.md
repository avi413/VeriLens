# VeriLens SDK Quickstart

This quickstart walks through the minimum steps to capture an image, extract metadata, hash the payload, sign it, and run a verification pipeline stub.

## 1. Install dependencies

```bash
npm install verilens-sdk # placeholder until published
```

## 2. Initialize the SDK runtime

```ts
import {
  ImageCaptureManager,
  MetadataService,
  CryptoHashService,
  BlockchainClient,
  VerificationEngine,
} from '@verilens/sdk/core';

const captureManager = new ImageCaptureManager();
const metadataService = new MetadataService();
const hashService = new CryptoHashService('sha256');
const blockchainClient = new BlockchainClient({ supportedChains: ['verilens-testnet'] });
const verificationEngine = new VerificationEngine();
```

## 3. Register verification stages

```ts
verificationEngine.registerStage({
  id: 'hash-integrity',
  description: 'Ensure captured bytes match expected digest.',
  async execute({ image, expectedHash }) {
    // TODO: inject hash service via stage context
    return {
      stageId: 'hash-integrity',
      success: Boolean(expectedHash && expectedHash.length > 0),
      summary: 'Placeholder integrity stage',
    };
  },
});
```

## 4. Capture, hash, sign, and verify

```ts
await captureManager.initialize();
const capture = await captureManager.captureImage({ resolution: '1920x1080' });
const metadata = await metadataService.extractMetadata(capture);
const hash = await hashService.hashPayload(capture.bytes ?? capture.uri);
const signature = await blockchainClient.signPayload(hash.digest, 'verilens-testnet');
const verification = await verificationEngine.runVerification({
  image: capture,
  metadata,
  expectedHash: hash.digest,
});
```

## 5. Handle results

```ts
console.log('Metadata', metadata);
console.log('Hash result', hash);
console.log('Signature', signature);
console.log('Verification report', verification);
```

> **Note:** All core services currently contain TODOs and throw placeholders. The quickstart demonstrates the intended wiring for future concrete adapters.

