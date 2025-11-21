import IBlockchainSigner from '../interfaces/IBlockchainSigner';
import ICryptoHasher from '../interfaces/ICryptoHasher';
import IImageCapture from '../interfaces/IImageCapture';
import IMetadataExtractor from '../interfaces/IMetadataExtractor';
import IVerificationPipeline from '../interfaces/IVerificationPipeline';
import { VerificationInput, VerificationResult, VerificationStage } from '../types';
import { BlockchainClientOptions } from './BlockchainClient';
import { ImageCaptureManager } from './ImageCaptureManager';
import { MetadataService } from './MetadataService';
export interface VeriLensSdkOptions {
    captureDriver: IImageCapture;
    metadataExtractors?: IMetadataExtractor[];
    cryptoHasher?: ICryptoHasher;
    blockchainSigner?: IBlockchainSigner;
    blockchainClientOptions?: BlockchainClientOptions;
    verificationStages?: VerificationStage[];
}
/**
 * Simple dependency injection container that wires together core services and adapters.
 */
export declare class VeriLensSdk implements IVerificationPipeline {
    readonly captureManager: ImageCaptureManager;
    readonly metadataService: MetadataService;
    readonly hashService: ICryptoHasher;
    readonly blockchainClient: IBlockchainSigner;
    private readonly verificationEngine;
    constructor(options: VeriLensSdkOptions);
    registerStage(stage: VerificationStage): void;
    runVerification(input: VerificationInput): Promise<VerificationResult>;
    getStageResults(): import("../types").VerificationStageResult[];
    initializeCapture(options?: Record<string, unknown>): Promise<void>;
}
export default VeriLensSdk;
