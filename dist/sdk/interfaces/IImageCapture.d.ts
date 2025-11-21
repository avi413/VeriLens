import { CaptureOptions, CapturedImage } from '../types';
/**
 * Abstraction for any platform-specific image capture implementation (mobile camera, web, desktop, etc.).
 */
export interface IImageCapture {
    /**
     * Prepare the capture session (permissions, resource allocation, warm-up).
     */
    initialize(options?: Record<string, unknown>): Promise<void>;
    /**
     * Capture a single image using the configured transport and options.
     */
    captureImage(options?: CaptureOptions): Promise<CapturedImage>;
    /**
     * Release any held resources and listeners.
     */
    dispose(): Promise<void>;
}
export default IImageCapture;
