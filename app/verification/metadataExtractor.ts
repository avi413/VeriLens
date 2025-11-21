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
      deviceMake: typeof tags.Make === 'string' ? tags.Make : undefined,
      deviceModel: typeof tags.Model === 'string' ? tags.Model : undefined,
      iso: typeof tags.ISO === 'number' ? tags.ISO : undefined,
      exposureTime:
        typeof tags.ExposureTime === 'number' ? tags.ExposureTime : undefined,
      fNumber: typeof tags.FNumber === 'number' ? tags.FNumber : undefined,
      latitude:
        typeof tags.GPSLatitude === 'number' ? tags.GPSLatitude : undefined,
      longitude:
        typeof tags.GPSLongitude === 'number' ? tags.GPSLongitude : undefined,
      altitude:
        typeof tags.GPSAltitude === 'number' ? tags.GPSAltitude : undefined,
      timestamp:
        typeof tags.DateTimeOriginal === 'number'
          ? new Date(tags.DateTimeOriginal * 1000).toISOString()
          : undefined,
      orientation:
        typeof tags.Orientation === 'number' ? tags.Orientation : undefined,
    };

    logger.debug('Metadata extracted', { fields: Object.keys(summary).length });
    return summary;
  } catch (error) {
    throw new AppError('Failed to extract metadata', {
      code: 'METADATA_EXTRACTION_FAILED',
      cause: error as Error,
    });
  }
}
