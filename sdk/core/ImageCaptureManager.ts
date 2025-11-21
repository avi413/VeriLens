import IImageCapture from '../interfaces/IImageCapture';
import { CaptureOptions, CapturedImage } from '../types';

/**
 * Default implementation that wires capture drivers with SDK lifecycle hooks.
 */
export class ImageCaptureManager implements IImageCapture {
  private initialized = false;

  constructor(private readonly driver: IImageCapture) {}

  async initialize(options?: Record<string, unknown>): Promise<void> {
    // TODO: Coordinate permission prompts, driver warm-up, and configuration.
    await this.driver.initialize(options);
    this.initialized = true;
  }

  async captureImage(options?: CaptureOptions): Promise<CapturedImage> {
    // TODO: Add retries, telemetry, and storage orchestration.
    if (!this.initialized) {
      throw new Error('ImageCaptureManager must be initialized before capture.');
    }

    return this.driver.captureImage(options);
  }

  async dispose(): Promise<void> {
    // TODO: Release device handles, listeners, and caches.
    await this.driver.dispose();
    this.initialized = false;
  }
}

export default ImageCaptureManager;
