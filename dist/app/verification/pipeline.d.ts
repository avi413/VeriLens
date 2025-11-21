import { MetadataSummary } from './metadataExtractor';
import { DepthFrame, DepthScore } from './depthAnalyzer';
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
export declare function runVerification(input: VerificationInput): Promise<VerificationResult>;
