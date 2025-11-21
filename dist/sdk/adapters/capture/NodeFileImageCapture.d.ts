import IImageCapture from '../../interfaces/IImageCapture';
import { CaptureOptions, CapturedImage, MetadataRecord } from '../../types';
export interface NodeFileImageCaptureOptions {
    defaultSourceUri?: string;
    metadataDefaults?: MetadataRecord;
}
/**
 * File-system backed capture adapter for Node environments. Useful for testing pipelines without real cameras.
 */
export declare class NodeFileImageCapture implements IImageCapture {
    private readonly options;
    private initialized;
    constructor(options?: NodeFileImageCaptureOptions);
    initialize(): Promise<void>;
    captureImage(options?: CaptureOptions): Promise<CapturedImage>;
    dispose(): Promise<void>;
    private inferMimeType;
}
export default NodeFileImageCapture;
