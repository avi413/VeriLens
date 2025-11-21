import IImageCapture from '../interfaces/IImageCapture';
import { CaptureOptions, CapturedImage } from '../types';
/**
 * Default implementation that wires capture drivers with SDK lifecycle hooks.
 */
export declare class ImageCaptureManager implements IImageCapture {
    private readonly driver;
    private initialized;
    constructor(driver: IImageCapture);
    initialize(options?: Record<string, unknown>): Promise<void>;
    captureImage(options?: CaptureOptions): Promise<CapturedImage>;
    dispose(): Promise<void>;
}
export default ImageCaptureManager;
