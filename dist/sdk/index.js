"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityManager = exports.VeriLensSDK = void 0;
// Main SDK Export (NEW - Refactored Clean Architecture)
var VeriLensRefactoredSDK_1 = require("./core/VeriLensRefactoredSDK");
Object.defineProperty(exports, "VeriLensSDK", { enumerable: true, get: function () { return VeriLensRefactoredSDK_1.VeriLensSDK; } });
var SecurityManager_1 = require("./core/SecurityManager");
Object.defineProperty(exports, "SecurityManager", { enumerable: true, get: function () { return SecurityManager_1.SecurityManager; } });
// Core Services
__exportStar(require("./core/ImageCaptureManager"), exports);
__exportStar(require("./core/MetadataService"), exports);
__exportStar(require("./core/CryptoHashService"), exports);
__exportStar(require("./core/BlockchainClient"), exports);
__exportStar(require("./core/VerificationEngine"), exports);
// Interfaces
__exportStar(require("./interfaces/IImageCapture"), exports);
__exportStar(require("./interfaces/IMetadataExtractor"), exports);
__exportStar(require("./interfaces/ICryptoHasher"), exports);
__exportStar(require("./interfaces/IBlockchainSigner"), exports);
__exportStar(require("./interfaces/IVerificationPipeline"), exports);
__exportStar(require("./utils/errorNormalizer"), exports);
__exportStar(require("./utils/logger"), exports);
__exportStar(require("./utils/validators"), exports);
__exportStar(require("./utils/configLoader"), exports);
__exportStar(require("./adapters/capture/NodeFileImageCapture"), exports);
__exportStar(require("./adapters/metadata/ExifMetadataExtractor"), exports);
__exportStar(require("./adapters/blockchain/LocalBlockchainSigner"), exports);
