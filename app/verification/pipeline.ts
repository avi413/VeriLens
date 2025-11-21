import { extractMetadata, MetadataSummary } from './metadataExtractor';
import { scoreDepthFrame, DepthFrame, DepthScore } from './depthAnalyzer';
import { sha256 } from '../crypto/hash';
import { getLogger } from '../shared/logger';
import { AppError } from '../shared/errors';

const logger = getLogger('verification:pipeline');

export type VerificationInput = {
  imageBuffer: Buffer;
  depthFrame?: DepthFrame;
  expectedDeviceId?: string;
};

export type VerificationResult = {
  checksum: string;
  depthScore?: DepthScore;
  exifScore: number;
  metadata: MetadataSummary;
  verdict: 'pass' | 'review' | 'fail';
};

const REQUIRED_METADATA_FIELDS: (keyof MetadataSummary)[] = [
  'deviceMake',
  'deviceModel',
  'iso',
  'exposureTime',
  'fNumber',
  'timestamp'
];

export async function runVerification(input: VerificationInput): Promise<VerificationResult> {
  if (!input.imageBuffer || input.imageBuffer.length === 0) {
    throw new AppError('Image buffer required for verification', {
      code: 'VALIDATION_ERROR'
    });
  }

  const checksum = sha256(input.imageBuffer);
  const metadata = extractMetadata(input.imageBuffer);
  const exifScore = computeExifConfidence(metadata, input.expectedDeviceId);

  let depthScore: DepthScore | undefined;
  if (input.depthFrame) {
    depthScore = scoreDepthFrame(input.depthFrame);
  }

  const verdict = resolveVerdict(exifScore, depthScore?.confidence);

  logger.info('Verification pipeline completed', { checksum, verdict, exifScore, depthScore });
  return {
    checksum,
    depthScore,
    exifScore,
    metadata,
    verdict
  };
}

function computeExifConfidence(metadata: MetadataSummary, expectedDeviceId?: string): number {
  const populated = REQUIRED_METADATA_FIELDS.filter((field) => Boolean(metadata[field])).length;
  let score = populated / REQUIRED_METADATA_FIELDS.length;

  if (
    expectedDeviceId &&
    metadata.deviceModel &&
    metadata.deviceModel.toLowerCase().includes(expectedDeviceId.toLowerCase())
  ) {
    score += 0.1;
  }

  if (metadata.latitude && metadata.longitude) {
    score += 0.05;
  }

  return Math.min(Number(score.toFixed(3)), 1);
}

function resolveVerdict(exifScore: number, depthConfidence?: number): VerificationResult['verdict'] {
  const combinedScore = depthConfidence ? (exifScore * 0.6 + depthConfidence * 0.4) : exifScore;

  if (combinedScore >= 0.8) return 'pass';
  if (combinedScore >= 0.5) return 'review';
  return 'fail';
}
