"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCaptureManager = void 0;
/**
 * Default implementation that wires capture drivers with SDK lifecycle hooks.
 */
class ImageCaptureManager {
    driver;
    initialized = false;
    constructor(driver) {
        this.driver = driver;
    }
    async initialize(options) {
        // TODO: Coordinate permission prompts, driver warm-up, and configuration.
        await this.driver.initialize(options);
        this.initialized = true;
    }
    async captureImage(options) {
        // TODO: Add retries, telemetry, and storage orchestration.
        if (!this.initialized) {
            throw new Error('ImageCaptureManager must be initialized before capture.');
        }
        return this.driver.captureImage(options);
    }
    async dispose() {
        // TODO: Release device handles, listeners, and caches.
        await this.driver.dispose();
        this.initialized = false;
    }
}
exports.ImageCaptureManager = ImageCaptureManager;
exports.default = ImageCaptureManager;
