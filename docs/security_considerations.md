# Security Considerations

## Secrets Management
- Prefer environment variables injected by the orchestrator for short-lived credentials.
- `app/shared/secrets.ts` falls back to `config/secrets.json` (ignored from VCS) and supports AES-GCM decryption for values encoded at rest.
- Ensure the optional `SECRET_DECRYPTION_KEY` is provided via env and rotated regularly.

## Encryption
- Captured images are encrypted locally with AES-256-GCM using the key referenced by `config/encryption.keyEnvVar`.
- Encrypted payloads are saved with `0600` permissions inside `config.storage.encryptedImageDir`.
- Rotate encryption keys per environment; track key identifiers alongside encrypted payload metadata for future re-encryption jobs.

## Blockchain Keys
- The signing client loads PKCS#8 PEM keys from the secrets layer, never from source control.
- Signing requests flow through an in-memory retry queue; failures are logged with minimal metadata to avoid leaking payload contents.

## Transport & API Calls
- The Axios client injects request IDs for traceability and enforces both timeouts and bounded retries.
- Augment headers with mTLS certificates or OAuth tokens via the provided `tokenProvider` hook when integrating with production APIs.

## Error Handling & Logging
- All thrown errors are normalized into `AppError`, preventing stack traces or raw payloads from leaving the process by default.
- Log statements emit structured JSON; avoid logging raw image buffers or secrets—prefer hashes and identifiers.

## Testing & Supply Chain
- Jest tests exercise crypto helpers and the verification pipeline to detect regressions.
- Pin dependencies in `package-lock.json` (generate after `npm install`) to lock cryptographic library versions.
- Run `npm audit` in CI and monitor CVE feeds for `axios`, `exif-parser`, and crypto-related transitive dependencies.
