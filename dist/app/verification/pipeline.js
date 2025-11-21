"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runVerification = runVerification;
const metadataExtractor_1 = require("./metadataExtractor");
const depthAnalyzer_1 = require("./depthAnalyzer");
const hash_1 = require("../crypto/hash");
const logger_1 = require("../shared/logger");
const errors_1 = require("../shared/errors");
const logger = (0, logger_1.getLogger)('verification:pipeline');
const REQUIRED_METADATA_FIELDS = [
    'deviceMake',
    'deviceModel',
    'iso',
    'exposureTime',
    'fNumber',
    'timestamp'
];
async function runVerification(input) {
    if (!input.imageBuffer || input.imageBuffer.length === 0) {
        throw new errors_1.AppError('Image buffer required for verification', {
            code: 'VALIDATION_ERROR'
        });
    }
    const checksum = (0, hash_1.sha256)(input.imageBuffer);
    const metadata = (0, metadataExtractor_1.extractMetadata)(input.imageBuffer);
    const exifScore = computeExifConfidence(metadata, input.expectedDeviceId);
    let depthScore;
    if (input.depthFrame) {
        depthScore = (0, depthAnalyzer_1.scoreDepthFrame)(input.depthFrame);
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
function computeExifConfidence(metadata, expectedDeviceId) {
    const populated = REQUIRED_METADATA_FIELDS.filter((field) => Boolean(metadata[field])).length;
    let score = populated / REQUIRED_METADATA_FIELDS.length;
    if (expectedDeviceId &&
        metadata.deviceModel &&
        metadata.deviceModel.toLowerCase().includes(expectedDeviceId.toLowerCase())) {
        score += 0.1;
    }
    if (metadata.latitude && metadata.longitude) {
        score += 0.05;
    }
    return Math.min(Number(score.toFixed(3)), 1);
}
function resolveVerdict(exifScore, depthConfidence) {
    const combinedScore = depthConfidence ? (exifScore * 0.6 + depthConfidence * 0.4) : exifScore;
    if (combinedScore >= 0.8)
        return 'pass';
    if (combinedScore >= 0.5)
        return 'review';
    return 'fail';
}
