"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFileImageCapture = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * File-system backed capture adapter for Node environments. Useful for testing pipelines without real cameras.
 */
class NodeFileImageCapture {
    options;
    initialized = false;
    constructor(options = {}) {
        this.options = options;
    }
    async initialize() {
        if (this.options.defaultSourceUri) {
            await promises_1.default.access(this.options.defaultSourceUri);
        }
        this.initialized = true;
    }
    async captureImage(options) {
        if (!this.initialized) {
            throw new Error('NodeFileImageCapture must be initialized before capture.');
        }
        const sourceUri = options?.sourceUri ?? this.options.defaultSourceUri;
        if (!sourceUri) {
            throw new Error('NodeFileImageCapture requires a sourceUri at runtime.');
        }
        const fileBuffer = await promises_1.default.readFile(sourceUri);
        const metadata = {
            ...this.options.metadataDefaults,
            ...options?.metadataHints,
            sourceUri,
        };
        return {
            id: node_crypto_1.default.randomUUID(),
            uri: `file://${sourceUri}`,
            bytes: new Uint8Array(fileBuffer),
            sizeInBytes: fileBuffer.byteLength,
            mimeType: this.inferMimeType(sourceUri),
            capturedAt: new Date(),
            metadata,
        };
    }
    async dispose() {
        this.initialized = false;
    }
    inferMimeType(filePath) {
        const ext = node_path_1.default.extname(filePath).toLowerCase();
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.webp':
                return 'image/webp';
            case '.heic':
                return 'image/heic';
            default:
                return 'application/octet-stream';
        }
    }
}
exports.NodeFileImageCapture = NodeFileImageCapture;
exports.default = NodeFileImageCapture;
