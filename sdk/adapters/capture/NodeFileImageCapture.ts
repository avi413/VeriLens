import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import IImageCapture from '../../interfaces/IImageCapture';
import { CaptureOptions, CapturedImage, MetadataRecord } from '../../types';

export interface NodeFileImageCaptureOptions {
  defaultSourceUri?: string;
  metadataDefaults?: MetadataRecord;
}

/**
 * File-system backed capture adapter for Node environments. Useful for testing pipelines without real cameras.
 */
export class NodeFileImageCapture implements IImageCapture {
  private initialized = false;

  constructor(private readonly options: NodeFileImageCaptureOptions = {}) {}

  async initialize(): Promise<void> {
    if (this.options.defaultSourceUri) {
      await fs.access(this.options.defaultSourceUri);
    }
    this.initialized = true;
  }

  async captureImage(options?: CaptureOptions): Promise<CapturedImage> {
    if (!this.initialized) {
      throw new Error('NodeFileImageCapture must be initialized before capture.');
    }

    const sourceUri = options?.sourceUri ?? this.options.defaultSourceUri;
    if (!sourceUri) {
      throw new Error('NodeFileImageCapture requires a sourceUri at runtime.');
    }

    const fileBuffer = await fs.readFile(sourceUri);
    const metadata: MetadataRecord = {
      ...this.options.metadataDefaults,
      ...options?.metadataHints,
      sourceUri,
    };

    return {
      id: crypto.randomUUID(),
      uri: `file://${sourceUri}`,
      bytes: new Uint8Array(fileBuffer),
      sizeInBytes: fileBuffer.byteLength,
      mimeType: this.inferMimeType(sourceUri),
      capturedAt: new Date(),
      metadata,
    };
  }

  async dispose(): Promise<void> {
    this.initialized = false;
  }

  private inferMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
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

export default NodeFileImageCapture;
