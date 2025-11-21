import exifParser from 'exif-parser';
import { AppError } from '../shared/errors';
import { getLogger } from '../shared/logger';

const logger = getLogger('verification:metadata');

export type MetadataSummary = {
  deviceMake?: string;
  deviceModel?: string;
  iso?: number;
  exposureTime?: number;
  fNumber?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  timestamp?: string;
  orientation?: number;
};

export function extractMetadata(buffer: Buffer): MetadataSummary {
  try {
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    const tags = result.tags ?? {};

    const summary: MetadataSummary = {
      deviceMake: tags.Make,
      deviceModel: tags.Model,
      iso: tags.ISO,
      exposureTime: tags.ExposureTime,
      fNumber: tags.FNumber,
      latitude: tags.GPSLatitude,
      longitude: tags.GPSLongitude,
      altitude: tags.GPSAltitude,
      timestamp: tags.DateTimeOriginal ? new Date(tags.DateTimeOriginal * 1000).toISOString() : undefined,
      orientation: tags.Orientation
    };

    logger.debug('Metadata extracted', { fields: Object.keys(summary).length });
    return summary;
  } catch (error) {
    throw new AppError('Failed to extract metadata', {
      code: 'METADATA_EXTRACTION_FAILED',
      cause: error as Error
    });
  }
}
