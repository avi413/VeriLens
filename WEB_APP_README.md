# 🌐 VeriLens Web Application

A complete web-based demonstration of the VeriLens SDK for cryptographic photo authenticity verification.

## ✨ Features

### 🔒 **Real VeriLens SDK Integration**
- **SHA-256 Cryptographic Hashing** - Secure image fingerprinting
- **AES-256-GCM Encryption** - Military-grade image encryption
- **EXIF Metadata Extraction** - Camera and device information analysis
- **Blockchain Signing** - Immutable proof-of-existence
- **Verification Pipeline** - Comprehensive authenticity scoring
- **Certificate Generation** - JSON authenticity certificates

### 🌟 **Web Interface Features**
- **Real-time Image Processing** - Upload and process images instantly
- **Live Server Status** - Health monitoring and component status
- **Interactive Results** - Visual feedback and detailed analysis
- **Certificate Download** - Export authenticity certificates
- **Demo Mode** - Test with mock data
- **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### 1. **Start the Web Application**
```bash
npm run start:web
```
This will:
- Build the TypeScript project
- Start the Express.js server on port 3000
- Initialize all VeriLens SDK components

### 2. **Access the Web App**
- **Main App:** http://localhost:3000
- **Simple Demo:** http://localhost:3000/demo  
- **Health Check:** http://localhost:3000/api/health

### 3. **Test Image Processing**
1. 📁 **Upload an image** using the file selector
2. 🚀 **Click "Process with Real VeriLens SDK"**
3. 📊 **View real-time processing results**
4. 🏆 **Download the authenticity certificate**

## 📋 API Endpoints

### **POST /api/verify-image**
Process an uploaded image through the complete VeriLens pipeline.

**Request:**
```bash
curl -X POST -F "image=@your-image.jpg" http://localhost:3000/api/verify-image
```

**Response:**
```json
{
  "success": true,
  "results": {
    "hash": { "digest": "...", "algorithm": "sha256" },
    "metadata": { "deviceMake": "Apple", "deviceModel": "iPhone 14" },
    "blockchain": { "signature": "...", "chainId": "verilens-web-testnet" },
    "verification": { "verdict": "pass", "exifScore": 0.85 }
  },
  "certificate": { /* Full authenticity certificate */ }
}
```

### **POST /api/demo**
Run a demo with mock data through the real SDK.

### **GET /api/health**
Check server health and SDK component status.

## 🔧 Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│   Web Interface     │    │   Express Server    │
│   (HTML/CSS/JS)     │◄──►│   (web-server.js)   │
└─────────────────────┘    └─────────────────────┘
                                      │
                          ┌─────────────────────┐
                          │   VeriLens SDK      │
                          │   - Hash Service    │
                          │   - Blockchain      │
                          │   - Metadata        │
                          │   - Encryption      │
                          └─────────────────────┘
```

## 🎯 Processing Pipeline

When you upload an image, here's what happens:

1. **🔐 Hash Generation**
   - Computes SHA-256 hash of image data
   - Creates cryptographic fingerprint

2. **📋 Metadata Extraction**
   - Extracts EXIF data (device, camera settings, GPS)
   - Analyzes metadata integrity

3. **🔒 Encryption**
   - Encrypts image with AES-256-GCM
   - Generates secure storage format

4. **⛓️ Blockchain Signing**
   - Signs image hash with blockchain key
   - Creates immutable proof-of-existence

5. **✅ Verification**
   - Runs authenticity scoring algorithm
   - Generates pass/review/fail verdict

6. **🏆 Certificate Generation**
   - Creates comprehensive authenticity certificate
   - Includes all verification data and signatures

## 🔍 What Gets Verified?

### ✅ **Hash Integrity**
- Ensures image hasn't been modified
- Detects any pixel-level changes

### 📷 **Metadata Analysis**
- Device make/model verification
- Camera settings plausibility
- GPS location consistency
- Timestamp validation

### ⛓️ **Blockchain Proof**
- Immutable signature verification
- Proof-of-existence timestamp
- Non-repudiation guarantee

### 🔒 **Encryption Validation**
- Secure storage verification
- Data integrity confirmation

## 🌟 Example Results

### **Pass Verdict** ✅
```json
{
  "verdict": "pass",
  "exifScore": 0.92,
  "confidence": 0.92,
  "checks": {
    "hashIntegrity": true,
    "metadataPresent": true,
    "blockchainSigned": true,
    "encryptionSuccessful": true
  }
}
```

### **Review Verdict** ⚠️
```json
{
  "verdict": "review",
  "exifScore": 0.65,
  "confidence": 0.65,
  "checks": {
    "hashIntegrity": true,
    "metadataPresent": false,
    "blockchainSigned": true,
    "encryptionSuccessful": true
  }
}
```

## 📱 Mobile Integration Ready

This web app demonstrates the same VeriLens SDK that can be integrated into mobile applications:

### **React Native Integration**
```javascript
import { VeriLensSdk } from 'verilens-sdk';
import { launchCamera } from 'react-native-camera';

const verifyPhoto = async () => {
  // 1. Capture image
  const image = await launchCamera();
  
  // 2. Process with VeriLens
  const sdk = new VeriLensSdk();
  const result = await sdk.verifyImage(image);
  
  // 3. Get certificate
  const certificate = result.certificate;
};
```

## 🔧 Development

### **File Structure**
```
├── web-server.js      # Express.js backend server
├── web-app.html       # Enhanced web interface 
├── web-demo.html      # Simple demo interface
├── dist/              # Compiled VeriLens SDK
└── package.json       # Dependencies and scripts
```

### **Available Scripts**
- `npm run web` - Start web server only
- `npm run start:web` - Build + start web server  
- `npm run build` - Compile TypeScript
- `npm test` - Run test suite

## 🎉 Success!

The VeriLens web application successfully demonstrates:

✅ **Real SDK Integration** - Using actual VeriLens components  
✅ **Image Processing** - Full cryptographic pipeline  
✅ **Blockchain Signing** - Immutable proof generation  
✅ **Certificate Creation** - Comprehensive authenticity documentation  
✅ **Web Interface** - User-friendly testing environment  

**Ready for production integration into mobile apps, web platforms, and enterprise systems!**