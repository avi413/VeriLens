import IMetadataExtractor from '../interfaces/IMetadataExtractor';
import { CapturedImage, MetadataRecord } from '../types';

/**
 * Provides metadata enrichment, aggregation, and validation for captured artifacts.
 */
export class MetadataService implements IMetadataExtractor {
  constructor(private delegates: IMetadataExtractor[] = []) {}

  registerExtractor(extractor: IMetadataExtractor): void {
    this.delegates.push(extractor);
  }

  async extractMetadata(image: CapturedImage): Promise<MetadataRecord> {
    // TODO: Execute delegates in sequence and merge their outputs.
    const results: MetadataRecord[] = [];

    for (const delegate of this.delegates) {
      results.push(await delegate.extractMetadata(image));
    }

    return this.mergeMetadata({}, this.combine(results));
  }

  async mergeMetadata(
    baseMetadata: MetadataRecord,
    overrides?: MetadataRecord
  ): Promise<MetadataRecord> {
    // TODO: Add schema enforcement and conflict resolution policies.
    return {
      ...baseMetadata,
      ...(await Promise.resolve(overrides ?? {})),
    };
  }

  private combine(records: MetadataRecord[]): MetadataRecord {
    // TODO: Provide deterministic merge semantics for nested keys.
    return records.reduce<MetadataRecord>(
      (acc, record) => ({ ...acc, ...record }),
      {}
    );
  }
}

export default MetadataService;
