# VeriLens Architecture Blueprint

## 1. Mission Statement
VeriLens delivers verifiable mobile photography by binding each capture to device sensors, depth cues, and a tamper-evident blockchain record. The system assures downstream consumers (media outlets, insurers, regulators) that an image originated from an authenticated device, has not been altered, and preserves contextual metadata.

## 2. High-Level Overview
- **Capture & Prep (React Native Mobile App)**: Handles camera control, sensor metadata extraction, local hashing, and offline secure queueing.
- **API Gateway (REST)**: Single ingress enforcing TLS, OAuth2/JWT, rate limits, and schema validation for all backend services.
- **Verification Engine**: Microservice cluster performing depth-based authenticity checks, metadata sanity verification, device trust attestation, and policy scoring.
- **Cryptographic Hashing Module**: Stateless service (can be part of Verification Engine or sidecar) that normalizes imagery and computes SHA-256 + perceptual hash.
- **Blockchain Signing Microservice**: Writes signed hash + metadata digest to a lightweight chain (e.g., Polygon PoS or L2 rollup) and issues a receipt.
- **Secure Storage (PostgreSQL + S3-compatible Object Store)**: Stores canonical metadata, verification outcomes, and encrypted assets; object storage holds original photos when retention is required.
- **Identity & Auth**: Uses Cognito/Auth0-style IdP for device enrollment, MFA, and token issuance; integrates with API Gateway.
- **Logging & Observability Layer**: Centralized OpenTelemetry pipeline feeding Prometheus/Grafana and ELK for traces, metrics, audits.

## 3. Component Responsibilities
### 3.1 React Native Mobile App
- Guided capture UX (focus, lighting hints, depth capture via LiDAR/dual cameras when available).
- Collects EXIF, GPS, IMU data, device identifier, and capture timestamp.
- Computes preliminary hash locally (for offline integrity) and encrypts payload.
- Stores payloads in an encrypted SQLite/Keychain when offline; syncs via background job.
- Performs attestation handshake (SafetyNet/iOS DeviceCheck) before uploading.

### 3.2 API Gateway
- Terminates TLS 1.3, enforces mutual TLS for device certificates as optional enhancement.
- Validates OAuth2 access tokens (PKCE for mobile), injects device claims, throttles per app/org.
- Routes to Verification Engine, Blockchain service, or Storage APIs via service mesh (Envoy/Istio).

### 3.3 Verification Engine
- Performs depth plausibility checks (stereo disparity, LiDAR confidence) and flags flat-surface spoofs.
- Cross-validates EXIF GPS vs. network geolocation vs. device clock drift.
- Detects sensor anomalies (sudden metadata edits, missing fields, improbable trajectories).
- Generates a trust score and structured verdict payload for downstream use.

### 3.4 Cryptographic Hashing Module
- Standardizes image (color space, orientation) before hashing.
- Produces SHA-256 + Blake3 + perceptual hash for robustness.
- Maintains hash catalog for deduplication and replay detection.

### 3.5 Blockchain Signing Microservice
- Bundles `{image_hash, metadata_digest, trust_score}` into a canonical message.
- Signs via HSM-backed keys, submits transaction to Polygon PoS (fast finality, low fees).
- Stores tx hash and signature receipt for inclusion in authenticity certificates.

### 3.6 Secure Storage
- PostgreSQL (Aurora/RDS) for relational data (users, devices, captures, verification results).
- Encrypted object storage (S3-compatible) for optional raw image retention and generated certificates.
- Row-level security to enforce tenant isolation; PITR backups, cross-region replicas.

### 3.7 Identity & Auth
- IdP issues short-lived JWT access tokens; device enrollment uses attestation proofs.
- Supports organizational RBAC (field agent, reviewer, auditor) mapped via scopes/claims.

### 3.8 Logging & Observability
- Client and server logs ship via HTTPS to OpenTelemetry collector.
- Metrics: request latency, verification queue depth, blockchain tx success rate.
- Audit trails are immutable (WORM storage) for compliance.

## 4. Deployment Topology
- **Mobile Clients** communicate over HTTPS to CDN + API Gateway.
- **Backend Services** run in Kubernetes (EKS/GKE), organized by namespace: `edge`, `verification`, `signature`, `storage`.
- **Service Mesh** (Istio) manages mTLS, retries, circuit breaking.
- **Background Workers** handle retry queues for blockchain submission and offline sync flushes.

## 5. Data Lifecycle
1. Capture event & local hash generation (device).
2. Secure upload (AES-GCM payload + OAuth token) to API Gateway.
3. Verification Engine enriches data, stores intermediate results.
4. Hashing Module computes canonical hashes.
5. Blockchain service signs and records proof; returns tx hash.
6. Certificate service compiles JSON certificate + QR code referencing tx hash.
7. Client receives certificate; optional sharing endpoint exposes verifiable link.

## 6. Security Considerations
- End-to-end TLS with certificate pinning in mobile app.
- Hardware-backed keystore for device keys; HSM for server signing keys.
- Strict input validation on metadata; reject EXIF rewrites outside tolerance.
- WAF + API Gateway threat detection (bot signatures, replay detection via nonce + timestamp).
- Data at rest encryption: PostgreSQL TDE, S3 SSE-KMS, mobile secure enclave for offline cache.
- Continuous attestation & jailbreak/root detection; remote wipe of credentials upon compromise.

## 7. Scalability Strategies
- Horizontal autoscaling for verification workers; GPU-enabled nodes for depth processing.
- Event-driven pipeline (Kafka/PubSub) decouples ingestion from blockchain latency.
- Read replicas & caching (Redis) for certificate validation endpoints.
- Use of lightweight blockchain (Polygon) keeps cost predictable; fallback to rollup if congestion detected.

## 8. Offline Mode Support
- Local queue with exponential backoff sync and conflict resolution.
- Partial verification offline: device stores sensor bundle + provisional hash; backend replays once online.
- UI surfaces certificate status (Pending, Verified, On-Chain) with retry controls.

## 9. Anti-Tampering / Anti-Spoofing Measures
- Depth anomaly detection (planar spoof flag, depth variance thresholds).
- Sensor cross-correlation (accelerometer vs. GPS motion) to detect static screen captures.
- Secure bootstrapping: app signed, runtime integrity checks, obfuscation, root/jailbreak detection.
- Blockchain proof plus Merkle inclusion ensures downstream consumers detect any alteration.

## 10. Logging & Observability
- Unified trace IDs propagate from mobile to backend.
- Structured logs (JSON) capture device ID, capture UUID, verification status.
- Alerting on unusual verification failure spikes, blockchain backlog, auth anomalies.

## 11. Tech Stack Summary
| Layer | Choice |
| --- | --- |
| Mobile | React Native + native camera modules |
| API Edge | AWS API Gateway or Kong w/ Envoy |
| Compute | Kubernetes (EKS) |
| Messaging | Kafka / AWS MSK |
| Storage | PostgreSQL + S3 |
| Blockchain | Polygon PoS |
| Observability | OpenTelemetry, Prometheus, Grafana, ELK |
| Auth | Cognito/Auth0 + OAuth2/OIDC |

## 12. Future Enhancements
- Integrate zero-knowledge proofs for privacy-preserving verification sharing.
- Add hardware secure elements (TEE) for partner OEM devices.
- Support additional depth sensors (ToF) and multi-spectral cues for higher assurance.
