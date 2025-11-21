import IMetadataExtractor from '../interfaces/IMetadataExtractor';
import { CapturedImage, MetadataRecord } from '../types';
/**
 * Provides metadata enrichment, aggregation, and validation for captured artifacts.
 */
export declare class MetadataService implements IMetadataExtractor {
    private delegates;
    constructor(delegates?: IMetadataExtractor[]);
    registerExtractor(extractor: IMetadataExtractor): void;
    extractMetadata(image: CapturedImage): Promise<MetadataRecord>;
    mergeMetadata(baseMetadata: MetadataRecord, overrides?: MetadataRecord): Promise<MetadataRecord>;
    private combine;
}
export default MetadataService;
