# 📸 VeriLens Camera Capture Guide

## 🚀 Live Photo Capture & Verification

The VeriLens web app now supports **real-time camera capture** for authentic photo verification testing!

### ✨ New Camera Features

#### **📹 Live Camera Access**
- **High-Quality Capture** - Up to 1920x1080 resolution
- **Back Camera Preferred** - Uses rear camera when available
- **Real-Time Preview** - See exactly what you're capturing
- **Cross-Platform** - Works on desktop and mobile browsers

#### **🔒 Security & Privacy**
- **Local Processing** - Camera stream stays in your browser
- **No Cloud Storage** - Photos processed directly through VeriLens SDK
- **Secure Transmission** - Images sent securely to local verification server

### 📱 How to Use Camera Capture

#### **Step 1: Start Camera**
1. 🌐 Open http://localhost:3000 in your browser
2. 📹 Click **"Start Camera"** in the Live Camera Capture section
3. ✅ Allow camera access when prompted by browser
4. 👀 See live camera preview

#### **Step 2: Capture Photo**
1. 📸 Point camera at your subject (document, object, scene)
2. 🖱️ Click **"Capture Photo"** when ready
3. 👁️ Review the captured image preview
4. 🔄 Click **"Retake Photo"** if needed, or **"Use This Photo"** to proceed

#### **Step 3: Verify with VeriLens**
1. 🚀 Click **"Process with Real VeriLens SDK"**
2. ⏳ Watch real-time processing steps:
   - 🔐 **SHA-256 Hashing** - Cryptographic fingerprint
   - 📋 **Metadata Extraction** - Camera settings, device info
   - 🔒 **AES-256-GCM Encryption** - Secure storage
   - ⛓️ **Blockchain Signing** - Immutable proof
   - ✅ **Verification Pipeline** - Authenticity scoring
3. 📊 View detailed results and confidence scores
4. 🏆 Download authenticity certificate

### 🎯 What Gets Analyzed

#### **📷 Image Properties**
- **Resolution & Quality** - Pixel dimensions and compression
- **File Size & Format** - JPEG encoding analysis
- **Capture Timestamp** - When the photo was taken

#### **🔍 Metadata Analysis**
- **Device Information** - Camera model and settings
- **GPS Location** - If available from device
- **Camera Settings** - ISO, aperture, exposure time
- **Orientation Data** - Image rotation information

#### **🛡️ Verification Checks**
- **Hash Integrity** - Ensures no pixel modifications
- **Metadata Consistency** - Validates camera data plausibility
- **Blockchain Proof** - Creates immutable signature
- **Encryption Status** - Confirms secure processing

### 🌟 Example Capture Session

```
📹 Camera Started → 📸 Photo Captured → 🚀 SDK Processing

Results:
✅ Verdict: PASS
📊 EXIF Score: 0.92
🔐 Hash: 7f3a9b2c1e8d5f4a...
⛓️ Signature: abc123def456...
🏆 Certificate: Generated & Available for Download
```

### 📱 Browser Compatibility

#### **✅ Supported Browsers**
- **Chrome/Chromium** - Full feature support
- **Firefox** - Full feature support  
- **Safari** - Full feature support
- **Edge** - Full feature support

#### **📱 Mobile Support**
- **iOS Safari** - Camera capture works
- **Android Chrome** - Camera capture works
- **Mobile Firefox** - Camera capture works

### 🔧 Troubleshooting

#### **❌ Camera Not Working?**
1. **Check Permissions** - Allow camera access in browser
2. **HTTPS Required** - Some browsers require secure connection
3. **Browser Support** - Ensure modern browser version
4. **Camera in Use** - Close other apps using camera

#### **🔒 Privacy Concerns?**
- **Local Processing** - All processing happens locally
- **No Recording** - Only single photos captured
- **No Storage** - Images not saved permanently
- **Secure Transmission** - Local server communication only

### 🚀 Alternative Methods

#### **📁 File Upload**
- Traditional file picker for existing photos
- Supports JPEG, PNG, and other formats
- Same verification pipeline as camera capture

#### **🎬 Demo Mode**
- Test with mock data if no camera available
- Shows full SDK pipeline with sample results

### 🎉 Ready to Test!

**Your VeriLens web app is now ready for real photo authenticity testing with live camera capture!**

👆 **Try it now:** http://localhost:3000

🔍 **Features to test:**
- 📸 Capture a photo of a document or object
- 🔍 See real EXIF metadata extraction
- 🛡️ Get authenticity verification results
- 📜 Download cryptographic certificate
- 🔄 Compare different photos and lighting conditions