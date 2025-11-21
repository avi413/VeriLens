import IMetadataExtractor from '../../interfaces/IMetadataExtractor';
import { CapturedImage, MetadataRecord } from '../../types';
/**
 * Metadata extractor that parses EXIF tags from image byte streams.
 */
export declare class ExifMetadataExtractor implements IMetadataExtractor {
    extractMetadata(image: CapturedImage): Promise<MetadataRecord>;
    mergeMetadata(baseMetadata: MetadataRecord, overrides?: MetadataRecord): Promise<MetadataRecord>;
}
export default ExifMetadataExtractor;
