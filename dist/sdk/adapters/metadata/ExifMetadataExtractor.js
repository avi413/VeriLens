"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExifMetadataExtractor = void 0;
const exif_parser_1 = __importDefault(require("exif-parser"));
/**
 * Metadata extractor that parses EXIF tags from image byte streams.
 */
class ExifMetadataExtractor {
    async extractMetadata(image) {
        if (!image.bytes) {
            return { exif: null };
        }
        try {
            const parser = exif_parser_1.default.create(Buffer.from(image.bytes));
            const result = parser.parse();
            return {
                exif: result.tags ?? {},
                imageSize: result.imageSize,
                thumbnailOffset: result.thumbnailOffset,
                thumbnailLength: result.thumbnailLength,
            };
        }
        catch (error) {
            return {
                exifError: error.message,
            };
        }
    }
    async mergeMetadata(baseMetadata, overrides) {
        return {
            ...baseMetadata,
            ...(overrides ?? {}),
        };
    }
}
exports.ExifMetadataExtractor = ExifMetadataExtractor;
exports.default = ExifMetadataExtractor;
