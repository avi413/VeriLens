# Adapters

This directory will host pluggable integrations such as:

- Camera drivers (native modules, browser APIs, desktop capture)
- Metadata providers (EXIF parsers, device telemetry bridges)
- Crypto/hash providers (WebCrypto, native bindings, cloud KMS)
- Blockchain signers and transport clients

Each adapter should implement the corresponding interface defined in `../interfaces` and export a factory for dependency injection.
