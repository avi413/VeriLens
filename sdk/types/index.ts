/**
 * Shared VeriLens SDK domain types.
 * Keep this file framework-agnostic so it can be consumed by web, mobile, or backend runtimes.
 */

export type HashAlgorithm = 'sha256' | 'sha512' | 'blake2b';

export type HashEncoding = 'hex' | 'base64' | 'base58';

export interface CaptureOptions {
  resolution?: `${number}x${number}`;
  format?: 'jpeg' | 'png' | 'heic' | 'raw';
  includeMetadata?: boolean;
  timeoutMs?: number;
  enablePreview?: boolean;
  metadataHints?: Record<string, unknown>;
}

export interface CapturedImage {
  id: string;
  uri: string;
  bytes?: Uint8Array;
  sizeInBytes?: number;
  mimeType?: string;
  capturedAt: Date;
  metadata?: MetadataRecord;
}

export type MetadataRecord = Record<string, unknown>;

export interface HashResult {
  algorithm: HashAlgorithm;
  encoding: HashEncoding;
  digest: string;
  inputLength?: number;
  issuedAt: Date;
}

export interface SignatureResult {
  signerId: string;
  chainId: string;
  signature: string;
  algorithm: string;
  payloadHash: string;
  issuedAt: Date;
  metadata?: MetadataRecord;
}

export interface TransactionReceipt {
  txHash: string;
  chainId: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  explorerUrl?: string;
  metadata?: MetadataRecord;
}

export interface VerificationInput {
  image: CapturedImage;
  metadata?: MetadataRecord;
  expectedHash?: string;
  verificationHints?: MetadataRecord;
}

export interface VerificationStageResult {
  stageId: string;
  success: boolean;
  summary: string;
  details?: MetadataRecord;
  error?: NormalizedError;
  durationMs?: number;
}

export interface VerificationResult {
  success: boolean;
  stages: VerificationStageResult[];
  generatedAt: Date;
  artifacts?: MetadataRecord;
}

export interface VerificationStage {
  id: string;
  description: string;
  execute(input: VerificationInput): Promise<VerificationStageResult>;
}

export interface NormalizedError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  cause?: NormalizedError;
  details?: MetadataRecord;
  retriable?: boolean;
}

export interface LoggerConfig {
  namespace?: string;
  level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  destination?: 'console' | 'custom';
  emitter?: (level: string, message: string, context?: MetadataRecord) => void;
}

export interface ValidationIssue {
  field: string;
  message: string;
  level?: 'error' | 'warning';
}

export interface SdkConfig {
  env: string;
  version: string;
  logging?: LoggerConfig;
  capture?: MetadataRecord;
  blockchain?: {
    defaultChainId: string;
    rpcUrl?: string;
  };
  crypto?: {
    defaultAlgorithm: HashAlgorithm;
  };
  verification?: MetadataRecord;
  [key: string]: unknown;
}

export interface ConfigLoaderOptions {
  env?: string;
  overrides?: Partial<SdkConfig>;
  searchPaths?: string[];
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
