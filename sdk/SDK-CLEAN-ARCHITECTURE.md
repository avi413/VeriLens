# VeriLens SDK - Clean Architecture

## Architecture Overview

You were absolutely right to question the previous architecture! The SDK should contain the core business logic, not the webapp. Here's the new clean architecture:

```
┌─────────────────────────────────────┐
│           WEBAPP (UI Layer)         │
│  - Simple UI components             │
│  - Event handlers                   │
│  - Display logic                    │
│  - Uses VeriLensSDK                 │
└─────────────────────────────────────┘
                   │
                   │ uses
                   ▼
┌─────────────────────────────────────┐
│        VeriLens SDK (Core)          │
│  - SecurityManager                  │
│  - All business logic               │
│  - Security services coordination   │
│  - Blockchain integration           │
│  - Cryptography                     │
│  - Hardware attestation             │
└─────────────────────────────────────┘
                   │
                   │ coordinates
                   ▼
┌─────────────────────────────────────┐
│       Security Services             │
│  - Anti-tampering                   │
│  - Blockchain service               │
│  - Hardware attestation             │
│  - Device sensors                   │
│  - Secure camera                    │
└─────────────────────────────────────┘
```

## Key Components

### 1. VeriLensSDK (Core Business Logic)
**File:** `/sdk/core/VeriLensRefactoredSDK.ts`

The main SDK class that provides:
- **Photo Capture API:** `capturePhoto()` - Full security pipeline
- **Image Verification:** `verifyImage(hash)` - Blockchain verification  
- **Camera Management:** `startCamera()` - Secure camera initialization
- **Status Monitoring:** `getStatus()` - System health check

**Key Methods:**
```typescript
const sdk = new VeriLensSDK(config);
await sdk.initialize();
const result = await sdk.capturePhoto(); // All security handled internally
const verification = await sdk.verifyImage(hash); // Blockchain verification
```

### 2. SecurityManager (Service Coordinator)
**File:** `/sdk/core/SecurityManager.ts`

Coordinates all security services:
- **Service Discovery:** Detects available security services
- **Security Validation:** `performSecurityCheck()` runs all validations
- **Device Attestation:** `collectDeviceAttestation()` gathers hardware data
- **Trust Scoring:** `calculateTrustScore()` computes security confidence

### 3. WebApp (Thin UI Layer)
**File:** `/sdk/examples/clean-webapp-integration.ts`

Simple consumer of the SDK:
```typescript
const app = new VeriLensWebApp();
await app.initialize(); // Calls SDK internally
await app.startCamera(); // Wrapper around SDK
await app.capturePhoto(); // Wrapper around SDK
```

## What Changed

### Before (Incorrect Architecture)
```
WebApp
├── All security logic ❌
├── All blockchain logic ❌  
├── All verification logic ❌
└── Complex implementation ❌

SDK
├── Empty interfaces ❌
└── No real functionality ❌
```

### After (Correct Architecture) 
```
WebApp
├── UI components ✅
├── Event handlers ✅
├── Display logic ✅
└── Simple SDK calls ✅

SDK  
├── SecurityManager ✅
├── All security logic ✅
├── All blockchain logic ✅
├── All verification logic ✅
└── Complete functionality ✅
```

## Usage Examples

### Simple Photo Capture (WebApp)
```typescript
// WebApp just makes simple calls
const app = new VeriLensWebApp();
await app.initialize();
await app.capturePhoto(); // SDK handles everything
```

### Advanced SDK Usage (Direct)
```typescript
// Direct SDK usage for advanced scenarios
const sdk = new VeriLensSDK({
  security: { securityLevel: 'maximum' },
  blockchain: { network: 'ethereum' }
});

await sdk.initialize();
const result = await sdk.capturePhoto();

if (result.success) {
  console.log('Trust Score:', result.verification.trustScore);
  console.log('Blockchain Hash:', result.blockchain.transactionHash);
}
```

## Benefits of Clean Architecture

### 1. **Proper Separation of Concerns**
- **SDK:** Reusable business logic
- **WebApp:** Simple UI layer

### 2. **SDK is Actually Useful**
- Contains real functionality
- Can be used by multiple frontends
- Handles all complex logic internally

### 3. **WebApp is Simple**
- Just UI and event handling
- Easy to maintain and extend
- No complex security logic

### 4. **Easy Integration**
```typescript
// Any app can use the SDK easily
import { VeriLensSDK } from './sdk';

const sdk = new VeriLensSDK();
await sdk.initialize();
// Full functionality available
```

## File Structure

```
sdk/
├── core/
│   ├── VeriLensRefactoredSDK.ts    # Main SDK class ✅
│   ├── SecurityManager.ts          # Service coordinator ✅
│   └── [other services]            # Individual services
├── examples/
│   └── clean-webapp-integration.ts # How to use SDK ✅
└── index.ts                        # Exports SDK ✅

webapp/ (if separate)
├── components/                     # UI components
├── pages/                         # App pages  
└── app.ts                         # Uses VeriLensSDK
```

## Migration Path

### For Existing WebApps
1. **Install SDK:** `npm install @verylens/sdk`
2. **Replace Logic:** Remove complex logic, use SDK methods
3. **Simplify:** Keep only UI and event handling

### For New Projects
1. **Use SDK:** Import `VeriLensSDK`
2. **Initialize:** Call `sdk.initialize()`
3. **Use Methods:** `capturePhoto()`, `verifyImage()`, etc.

## Summary

The SDK now properly contains:
- ✅ All security logic (SecurityManager)
- ✅ All blockchain integration  
- ✅ All verification algorithms
- ✅ Complete photo capture pipeline
- ✅ Hardware attestation
- ✅ Trust score calculation

The WebApp is now just:
- ✅ Simple SDK wrapper methods
- ✅ UI components and display
- ✅ Event handlers
- ✅ Easy to understand and maintain

This is the correct architecture where the SDK is the reusable core and the webapp is a simple consumer!