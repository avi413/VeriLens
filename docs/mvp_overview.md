# VeriLens MVP Overview

## Goals
- Capture images on-device, encrypt them locally, and persist encrypted artifacts.
- Extract metadata, compute hashes, and run a verification pipeline with depth and EXIF scoring.
- Sign critical events with a blockchain key pair using a resilient retry queue.
- Provide a modular Node.js/TypeScript backend scaffold with centralized logging, error handling, and configuration.

## High-Level Architecture
- `app/mobile`: Device-facing utilities such as `ImageCaptureHandler` that persists encrypted captures using AES-256-GCM.
- `app/verification`: Metadata extraction (via `exif-parser`), depth analysis, and the decision pipeline that emits pass/review/fail verdicts.
- `app/crypto`: Cryptographic helpers for hashing and encryption to keep logic reusable across modules.
- `app/api`: Axios-based HTTP client with timeout enforcement, retries, request correlation IDs, and auth injection hooks.
- `app/blockchain`: Signing client coupled with a resilient in-memory retry queue that submits signing jobs using exponential backoff.
- `app/shared`: Cross-cutting concerns such as config loading, structured logging, secrets access, and centralized error primitives.
- `config`: Environment-aware JSON config + loader used across modules.
- `tests`: Jest test harness with unit coverage for hashing and verification logic.

## Data Flow
1. Image buffer arrives at the mobile layer where it is validated, hashed, and encrypted with the configured key. The encrypted payload is stored on disk with strict permissions.
2. The verification pipeline ingests the buffered image and optional depth frame, extracts EXIF metadata, evaluates depth noise, and returns a verdict with confidence scores.
3. When an immutable audit trail is required, digests produced by the pipeline are enqueued for blockchain signing. The retry queue guarantees delivery or explicit failure after configurable attempts.
4. External services are called through the resilient API client, ensuring consistent telemetry through the logging subsystem.

## Operational Characteristics
- Logging: JSON payloads tagged with a `scope` string so log aggregation tools can filter by module.
- Errors: Every module throws `AppError` with machine-parseable codes and HTTP-friendly status codes.
- Configuration: `config/environment.ts` merges `default.json` with environment-specific overrides, cached for reuse.
- Security: Secrets are read from env or an encrypted JSON file; image payloads are encrypted with AES-256-GCM before touching disk.
- Testing: Jest + ts-jest provide quick feedback; add new specs under `tests/unit` to protect regression-prone modules.
