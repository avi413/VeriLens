# VeriLens — Cryptographic Photo Authenticity Framework

VeriLens is a modular framework for proving that a photo was captured by a real device, at a specific time and place, without AI manipulation. The system combines secure capture, metadata preservation, cryptographic hashing, verification heuristics, and blockchain anchoring to produce public authenticity certificates.

## Components
- MVP application: capture, metadata extraction, hashing, blockchain signing.
- Verification engine: depth analysis, EXIF validation, tamper detection.
- SDK foundation: reusable interfaces, core modules, adapters, utilities, and examples.

## Key Capabilities
- Secure device-side capture and EXIF extraction.
- Metadata integrity checks, depth-based realism signals, and GPS plausibility rules.
- SHA-256 hashing across the image bitmap plus metadata bundle.
- Blockchain signing for non-repudiable proof-of-existence.
- Authenticity certificates delivered as JSON, QR payloads, and future PDF exports.

## Repository Structure

### Application (`app/`)
- `api/`: request pipeline and http client helpers.
- `blockchain/`: signing clients and retry queue.
- `crypto/`: symmetric encryption and hashing utilities.
- `mobile/`: capture handler primitives for native shells.
- `shared/`: common errors, logging, and secret helpers.
- `verification/`: metadata + depth analyzers and orchestration pipeline.

### SDK (`sdk/`)
- `core/`: baseline implementations of capture, crypto, metadata, and verification services.
- `interfaces/`: contracts for blockchain signer, hash service, verification pipeline, etc.
- `adapters/`: environment-specific adapters (blockchain, capture, metadata).
- `utils/`: config loader, logger, validators, and error normalization.
- `examples/`: Quickstart guide and runnable sample usage.
- `types/`: shared TypeScript declarations.
- `ROADMAP.md`: living roadmap for SDK deliverables.

### Documentation & Supporting Assets
- `architecture/`: diagrams (system, data flow, sequence) and architecture write-up.
- `docs/`: MVP overview, security considerations, verification pipeline deep dive.
- `config/`: environment presets (`default.json`, `development.json`, `secrets.example.json`).
- `tests/`: Jest-based unit tests for hashing, SDK utilities, and verification engine logic.

## Getting Started

### Prerequisites
- Node.js 18+ (TS features rely on modern tooling).
- npm or yarn.
- Access to blockchain credentials if you plan to anchor proofs locally.

### Install dependencies
```bash
npm install
# or
yarn install
```

### Configure environment
Copy `config/secrets.example.json` or load values via environment variables (e.g. `.env`) and supply:
- `BLOCKCHAIN_RPC_URL`
- `BLOCKCHAIN_PRIVATE_KEY`
- `API_BASE_URL`
- `ENCRYPTION_KEY`

### Run the MVP pipeline
From the repo root:
```bash
npm run dev
```
This executes `ts-node` with the project `tsconfig` and boots the API helper located in `app/api`. Adjust the entry point as you flesh out additional services.

### Mobile prototype
Mobile glue code lives under `app/mobile`. The repo currently exposes helper modules (e.g., `imageCaptureHandler.ts`) that you can integrate into a React Native or native shell. Bring your own bundler (`expo`, `xcodebuild`, etc.) to exercise them.

## Testing
Run the Jest suite (defaults to `tests/unit`):
```bash
npm test
```
Add new specs near the code under test (e.g., `tests/unit/sdk` for SDK logic).

## Verification Pipeline (High-Level)
1. Capture image and collect EXIF + sensor metadata.
2. Encrypt payload locally and hash image + metadata bundle.
3. Submit payload to the backend.
4. Run verification engine checks (EXIF, depth cues, GPS, device signature, environment).
5. Anchor the resulting hash on-chain.
6. Return the authenticity certificate to the requesting client.

See `docs/verification_pipeline.md` for an end-to-end sequence.

## SDK Foundation Status
- Interfaces defined for capture, hashing, blockchain signing, metadata extraction, and verification.
- Skeleton implementations in `sdk/core`.
- Adapter-ready folder structure to support platform-specific integrations.
- Usage examples in `sdk/examples`.

## Roadmap Snapshot
- Full mobile SDK with native bindings.
- On-device depth sensing + fusion.
- Zero-knowledge metadata proofs.
- Video authenticity support.
- Public verification portal and newsroom/legal integrations.

Read `sdk/ROADMAP.md` for the detailed roadmap and milestones.