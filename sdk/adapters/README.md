# Adapters

This directory hosts pluggable integrations such as:

- Camera drivers (native modules, browser APIs, desktop capture)
- Metadata providers (EXIF parsers, device telemetry bridges)
- Crypto/hash providers (WebCrypto, native bindings, cloud KMS)
- Blockchain signers and transport clients

Current reference adapters:

- `capture/NodeFileImageCapture` – read images from the filesystem for local development.
- `metadata/ExifMetadataExtractor` – parse EXIF data from captured bytes.
- `blockchain/LocalBlockchainSigner` – deterministic signer for integration tests.

Each adapter implements the corresponding interface defined in `../interfaces` and can be injected into `VeriLensSdk`.
