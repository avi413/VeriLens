import IBlockchainSigner from '../interfaces/IBlockchainSigner';
import ICryptoHasher from '../interfaces/ICryptoHasher';
import IImageCapture from '../interfaces/IImageCapture';
import IMetadataExtractor from '../interfaces/IMetadataExtractor';
import IVerificationPipeline from '../interfaces/IVerificationPipeline';
import {
  VerificationInput,
  VerificationResult,
  VerificationStage,
} from '../types';
import { BlockchainClient, BlockchainClientOptions } from './BlockchainClient';
import { CryptoHashService } from './CryptoHashService';
import { ImageCaptureManager } from './ImageCaptureManager';
import { MetadataService } from './MetadataService';
import { VerificationEngine } from './VerificationEngine';

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
export class VeriLensSdk implements IVerificationPipeline {
  public readonly captureManager: ImageCaptureManager;
  public readonly metadataService: MetadataService;
  public readonly hashService: ICryptoHasher;
  public readonly blockchainClient: IBlockchainSigner;
  private readonly verificationEngine: VerificationEngine;

  constructor(options: VeriLensSdkOptions) {
    this.captureManager = new ImageCaptureManager(options.captureDriver);
    this.metadataService = new MetadataService([
      ...(options.metadataExtractors ?? []),
    ]);
    this.hashService = options.cryptoHasher ?? new CryptoHashService();
    this.blockchainClient =
      options.blockchainSigner ??
      new BlockchainClient(options.blockchainClientOptions);

    this.verificationEngine = new VerificationEngine();
    options.verificationStages?.forEach((stage) =>
      this.verificationEngine.registerStage(stage)
    );
  }

  registerStage(stage: VerificationStage): void {
    this.verificationEngine.registerStage(stage);
  }

  async runVerification(input: VerificationInput): Promise<VerificationResult> {
    return this.verificationEngine.runVerification(input);
  }

  getStageResults() {
    return this.verificationEngine.getStageResults();
  }

  async initializeCapture(options?: Record<string, unknown>): Promise<void> {
    await this.captureManager.initialize(options);
  }
}

export default VeriLensSdk;
