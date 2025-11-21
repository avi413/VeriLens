import { CapturedImage, MetadataRecord } from '../types';

/**
 * Contract for extracting structured metadata from a captured image or accompanying payloads.
 */
export interface IMetadataExtractor {
  /**
   * Inspect the provided capture artifact and return normalized metadata.
   */
  extractMetadata(image: CapturedImage): Promise<MetadataRecord>;

  /**
   * Merge SDK-generated metadata with externally supplied hints.
   */
  mergeMetadata(
    baseMetadata: MetadataRecord,
    overrides?: MetadataRecord
  ): Promise<MetadataRecord>;
}

export default IMetadataExtractor;
