"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataService = void 0;
/**
 * Provides metadata enrichment, aggregation, and validation for captured artifacts.
 */
class MetadataService {
    delegates;
    constructor(delegates = []) {
        this.delegates = delegates;
    }
    registerExtractor(extractor) {
        this.delegates.push(extractor);
    }
    async extractMetadata(image) {
        // TODO: Execute delegates in sequence and merge their outputs.
        const results = [];
        for (const delegate of this.delegates) {
            results.push(await delegate.extractMetadata(image));
        }
        return this.mergeMetadata({}, this.combine(results));
    }
    async mergeMetadata(baseMetadata, overrides) {
        // TODO: Add schema enforcement and conflict resolution policies.
        return {
            ...baseMetadata,
            ...(await Promise.resolve(overrides ?? {})),
        };
    }
    combine(records) {
        // TODO: Provide deterministic merge semantics for nested keys.
        return records.reduce((acc, record) => ({ ...acc, ...record }), {});
    }
}
exports.MetadataService = MetadataService;
exports.default = MetadataService;
