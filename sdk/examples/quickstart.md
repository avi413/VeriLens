# VeriLens SDK Quickstart

This quickstart walks through the minimum steps to capture an image, extract metadata, hash the payload, sign it, and run a verification pipeline stub.

## 1. Install dependencies

```bash
npm install verilens-sdk # placeholder until published
```

## 2. Initialize the SDK runtime

```ts
import {
  VeriLensSdk,
  NodeFileImageCapture,
  ExifMetadataExtractor,
  LocalBlockchainSigner,
} from '@verilens/sdk';

const sdk = new VeriLensSdk({
  captureDriver: new NodeFileImageCapture({ defaultSourceUri: './fixtures/sample.jpg' }),
  metadataExtractors: [new ExifMetadataExtractor()],
  blockchainSigner: new LocalBlockchainSigner({ chainId: 'verilens-testnet' }),
});
```

## 3. Register verification stages

```ts
sdk.registerStage({
  id: 'hash-integrity',
  description: 'Ensure captured bytes match expected digest.',
  async execute({ expectedHash }) {
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
await sdk.initializeCapture();
const capture = await sdk.captureManager.captureImage({ resolution: '1920x1080' });
const metadata = await sdk.metadataService.extractMetadata(capture);
const hash = await sdk.hashService.hashPayload(capture.bytes ?? capture.uri);
const signature = await sdk.blockchainClient.signPayload(hash.digest, 'verilens-testnet');
const verification = await sdk.runVerification({
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

> **Note:** The sample uses the Node file capture adapter and local blockchain signer so you can exercise the pipeline without hardware dependencies. Swap in production adapters per platform when available.

