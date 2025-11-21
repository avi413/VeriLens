# VeriLens SDK Roadmap

## Phase 0 – Foundations (current)
- Establish SDK folder structure, interfaces, and placeholder implementations.
- Define shared types, utilities, and documentation scaffolding.

## Phase 1 – Capture & Metadata (Weeks 1-3)
- Deliver production-ready image capture adapters for iOS, Android, and Web.
- Implement metadata extraction pipelines (EXIF, device, geolocation) with validation.
- Add automated tests for capture edge cases and metadata normalization.

## Phase 2 – Crypto & Blockchain (Weeks 3-6)
- Integrate WebCrypto/native crypto providers with streaming hash support.
- Provide signer adapters (custodial, device-based, cloud HSM) and transaction relayers.
- Ship deterministic error taxonomy plus retries/backoff for network flows.

## Phase 3 – Verification Pipeline (Weeks 5-8)
- Introduce configurable stage graph (parallel + conditional execution).
- Persist verification reports with audit trails and reproducible artifacts.
- Offer policy/rule authoring SDK + schema validation tooling.

## Phase 4 – Developer Experience (Weeks 7-10)
- Generate API reference docs, typed client stubs, and example apps.
- Provide CLI tooling for simulator runs, diagnostics, and config management.
- Add telemetry hooks (metrics, structured logs) with opt-in privacy controls.

## Phase 5 – Release & Distribution (Weeks 10-12)
- Harden CI/CD to publish npm, Maven, and CocoaPods artifacts.
- Establish semantic versioning, changelog automation, and backward compatibility gates.
- Complete security review (threat modeling, dependency scanning, pen test) before GA.
