# VeriLens — Cryptographic Photo Authenticity Framework

VeriLens is a modular framework for proving the authenticity of real photos at the moment of capture.  
It provides a secure pipeline that verifies a photo was taken by a real device, at a real time and place, and was not generated or manipulated by AI.

This repository contains three main components:

•⁠  ⁠*MVP Application* — image capture, metadata extraction, hashing, blockchain signing.
•⁠  ⁠*Verification Engine* — depth analysis, EXIF validation, tamper detection.
•⁠  ⁠*SDK Foundation* — interfaces, core modules, adapters, utilities, and examples.

---

## 🚀 Vision

As AI-generated images continue to explode in quality, the world needs a reliable method to distinguish real photos from synthetic content.  
VeriLens aims to become a universal standard for *cryptographic image authenticity*, combining:

✔ Secure on-device capture  
✔ Metadata integrity  
✔ Depth/real-world signal verification  
✔ Blockchain-backed signing  
✔ Public authenticity certificates  

---

## 🧩 Project Structure

/app/ /mobile/               # Mobile app code (React Native / Swift / Kotlin) /api/                  # REST API (capture → verify → sign → return certificate) /verification/         # Depth & metadata verification pipeline /crypto/               # Hashing + signature generation /blockchain/           # Blockchain signing microservice /shared/               # Shared models, constants, helpers

/sdk/ /core/                 # Core skeleton implementations /interfaces/           # SDK interfaces (IImageCapture, IHashing, etc.) /adapters/             # Future platform adapters /utils/                # Logging, validation, error normalization /types/                # Shared TS types /examples/             # Sample usage + Quickstart guide ROADMAP.md

/architecture/ architecture.md system_diagram.md sequence_diagrams.md data_flow.md

/docs/ mvp_overview.md verification_pipeline.md security_considerations.md

/tests/ ...jest/pytest tests...

/config/ env.example config.template.json

---

## 🛠 Core Features

### 🖼 1. Secure Image Capture
•⁠  ⁠On-device EXIF extraction  
•⁠  ⁠Sensor metadata (timestamp, device ID, GPS)  
•⁠  ⁠Local encryption before upload  
•⁠  ⁠Anti-spoofing protections  

### 🔐 2. Cryptographic Hashing
•⁠  ⁠SHA-256 hashing of:
  - image bitmap  
  - metadata bundle  
•⁠  ⁠Produces a tamper-proof fingerprint

### 🧬 3. Verification Engine
Checks authenticity signals:
•⁠  ⁠EXIF consistency  
•⁠  ⁠Depth estimation / real-scene cues  
•⁠  ⁠GPS plausibility  
•⁠  ⁠Device signature integrity  
•⁠  ⁠Environment validation

### ⛓ 4. Blockchain Signing
•⁠  ⁠Lightweight signing microservice  
•⁠  ⁠Proof-of-existence via hash anchoring  
•⁠  ⁠Public verification endpoint  

### 📄 5. Authenticity Certificate
Returned as:
•⁠  ⁠JSON object  
•⁠  ⁠QR code  
•⁠  ⁠Future: signed PDF  

---

## 📦 Installing & Running (MVP)

### 1. Install dependencies
```bash
npm install
# or
yarn install

2.⁠ ⁠Environment setup

Create .env based on /config/env.example:

BLOCKCHAIN_RPC_URL=
BLOCKCHAIN_PRIVATE_KEY=
API_BASE_URL=
ENCRYPTION_KEY=

3.⁠ ⁠Run API

cd app/api
npm run dev

4.⁠ ⁠Run mobile app

cd app/mobile
npm start


---

🧪 Testing

Run the test suite:

npm test
# or:
pytest


---

🔍 Verification Pipeline (High-Level)

1.⁠ ⁠Capture Event


2.⁠ ⁠Extract EXIF + sensor metadata


3.⁠ ⁠Local encryption


4.⁠ ⁠Hash(image + metadata)


5.⁠ ⁠Send to backend


6.⁠ ⁠Run Verification Engine


7.⁠ ⁠Blockchain signing


8.⁠ ⁠Return authenticity certificate



See /docs/verification_pipeline.md for full details.


---

🔧 SDK Foundation

The SDK is not complete yet — this is the foundation:

Interfaces for all core modules

Skeleton implementations

Adapter-ready structure

Example usage

Clear future roadmap


This allows the SDK to evolve independently of the main app.


---

🌍 Future Roadmap (Short Version)

Full mobile SDK

On-device depth sensing

Zero-knowledge metadata proofs

Support for video authenticity

Public verification portal

Integrations for:

news agencies

social platforms

legal evidence systems

insurance companies



Full roadmap in /sdk/ROADMAP.md.