"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriLensSdk = void 0;
const BlockchainClient_1 = require("./BlockchainClient");
const CryptoHashService_1 = require("./CryptoHashService");
const ImageCaptureManager_1 = require("./ImageCaptureManager");
const MetadataService_1 = require("./MetadataService");
const VerificationEngine_1 = require("./VerificationEngine");
/**
 * Simple dependency injection container that wires together core services and adapters.
 */
class VeriLensSdk {
    captureManager;
    metadataService;
    hashService;
    blockchainClient;
    verificationEngine;
    constructor(options) {
        this.captureManager = new ImageCaptureManager_1.ImageCaptureManager(options.captureDriver);
        this.metadataService = new MetadataService_1.MetadataService([
            ...(options.metadataExtractors ?? []),
        ]);
        this.hashService = options.cryptoHasher ?? new CryptoHashService_1.CryptoHashService();
        this.blockchainClient =
            options.blockchainSigner ??
                new BlockchainClient_1.BlockchainClient(options.blockchainClientOptions);
        this.verificationEngine = new VerificationEngine_1.VerificationEngine();
        options.verificationStages?.forEach((stage) => this.verificationEngine.registerStage(stage));
    }
    registerStage(stage) {
        this.verificationEngine.registerStage(stage);
    }
    async runVerification(input) {
        return this.verificationEngine.runVerification(input);
    }
    getStageResults() {
        return this.verificationEngine.getStageResults();
    }
    async initializeCapture(options) {
        await this.captureManager.initialize(options);
    }
}
exports.VeriLensSdk = VeriLensSdk;
exports.default = VeriLensSdk;
