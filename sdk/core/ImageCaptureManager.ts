import IImageCapture from '../interfaces/IImageCapture';
import { CaptureOptions, CapturedImage } from '../types';

/**
 * Default implementation that wires capture drivers with SDK lifecycle hooks.
 */
export class ImageCaptureManager implements IImageCapture {
  private initialized = false;

  /**
   * TODO: Inject platform-specific dependencies through the constructor once implementations exist.
   */
  constructor(private readonly driver?: IImageCapture) {}

  async initialize(options?: Record<string, unknown>): Promise<void> {
    // TODO: Coordinate permission prompts, driver warm-up, and configuration.
    if (this.driver) {
      await this.driver.initialize(options);
    }
    this.initialized = true;
  }

  async captureImage(options?: CaptureOptions): Promise<CapturedImage> {
    // TODO: Add retries, telemetry, and storage orchestration.
    if (!this.initialized) {
      throw new Error('ImageCaptureManager must be initialized before capture.');
    }

    if (!this.driver) {
      throw new Error('No image capture driver provided yet. TODO: inject driver.');
    }

    return this.driver.captureImage(options);
  }

  async dispose(): Promise<void> {
    // TODO: Release device handles, listeners, and caches.
    if (this.driver) {
      await this.driver.dispose();
    }
    this.initialized = false;
  }
}

export default ImageCaptureManager;
