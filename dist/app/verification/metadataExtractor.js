"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMetadata = extractMetadata;
const exif_parser_1 = __importDefault(require("exif-parser"));
const errors_1 = require("../shared/errors");
const logger_1 = require("../shared/logger");
const logger = (0, logger_1.getLogger)('verification:metadata');
function extractMetadata(buffer) {
    try {
        const parser = exif_parser_1.default.create(buffer);
        const result = parser.parse();
        const tags = result.tags ?? {};
        const summary = {
            deviceMake: typeof tags.Make === 'string' ? tags.Make : undefined,
            deviceModel: typeof tags.Model === 'string' ? tags.Model : undefined,
            iso: typeof tags.ISO === 'number' ? tags.ISO : undefined,
            exposureTime: typeof tags.ExposureTime === 'number' ? tags.ExposureTime : undefined,
            fNumber: typeof tags.FNumber === 'number' ? tags.FNumber : undefined,
            latitude: typeof tags.GPSLatitude === 'number' ? tags.GPSLatitude : undefined,
            longitude: typeof tags.GPSLongitude === 'number' ? tags.GPSLongitude : undefined,
            altitude: typeof tags.GPSAltitude === 'number' ? tags.GPSAltitude : undefined,
            timestamp: typeof tags.DateTimeOriginal === 'number'
                ? new Date(tags.DateTimeOriginal * 1000).toISOString()
                : undefined,
            orientation: typeof tags.Orientation === 'number' ? tags.Orientation : undefined,
        };
        logger.debug('Metadata extracted', { fields: Object.keys(summary).length });
        return summary;
    }
    catch (error) {
        throw new errors_1.AppError('Failed to extract metadata', {
            code: 'METADATA_EXTRACTION_FAILED',
            cause: error,
        });
    }
}
