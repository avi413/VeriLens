import exifParser from 'exif-parser';
import IMetadataExtractor from '../../interfaces/IMetadataExtractor';
import { CapturedImage, MetadataRecord } from '../../types';

/**
 * Metadata extractor that parses EXIF tags from image byte streams.
 */
export class ExifMetadataExtractor implements IMetadataExtractor {
  async extractMetadata(image: CapturedImage): Promise<MetadataRecord> {
    if (!image.bytes) {
      return { exif: null };
    }

    try {
      const parser = exifParser.create(Buffer.from(image.bytes));
      const result = parser.parse();
      return {
        exif: result.tags ?? {},
        imageSize: result.imageSize,
        thumbnailOffset: result.thumbnailOffset,
        thumbnailLength: result.thumbnailLength,
      };
    } catch (error) {
      return {
        exifError: (error as Error).message,
      };
    }
  }

  async mergeMetadata(
    baseMetadata: MetadataRecord,
    overrides?: MetadataRecord
  ): Promise<MetadataRecord> {
    return {
      ...baseMetadata,
      ...(overrides ?? {}),
    };
  }
}

export default ExifMetadataExtractor;
