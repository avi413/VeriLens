import { writeEncryptedFile } from '../crypto/encryption';
import { sha256 } from '../crypto/hash';
import { getLogger } from '../shared/logger';
import { AppError } from '../shared/errors';
import { loadConfig } from '../../config/environment';

const config = loadConfig();
const logger = getLogger('mobile:image-capture');

export type CaptureRequest = {
  deviceId: string;
  format: 'jpeg' | 'png' | 'heic';
  buffer: Buffer;
  metadata?: Record<string, unknown>;
};

export type CaptureResponse = {
  checksum: string;
  encryptedPath: string;
  capturedAt: string;
};

type EncryptionKeyProvider = () => Promise<Buffer>;

async function defaultKeyProvider(): Promise<Buffer> {
  const envKey = process.env[config.encryption.keyEnvVar];
  if (!envKey) {
    throw new AppError('Missing encryption key for captured images', {
      code: 'CONFIGURATION_ERROR'
    });
  }
  return Buffer.from(envKey, 'base64');
}

export class ImageCaptureHandler {
  constructor(private readonly keyProvider: EncryptionKeyProvider = defaultKeyProvider) {}

  async handleCapture(request: CaptureRequest): Promise<CaptureResponse> {
    this.validateRequest(request);

    const key = await this.keyProvider();
    const checksum = sha256(request.buffer);
    const fileName = `${request.deviceId}-${Date.now()}`;

    writeEncryptedFile(fileName, request.buffer, key);
    logger.info('Image captured and encrypted', { deviceId: request.deviceId, checksum });

    return {
      checksum,
      encryptedPath: `${config.storage.encryptedImageDir}/${fileName}.enc.json`,
      capturedAt: new Date().toISOString()
    };
  }

  private validateRequest(request: CaptureRequest) {
    if (!request.deviceId) {
      throw new AppError('Device identifier required', {
        code: 'VALIDATION_ERROR',
        statusCode: 400
      });
    }

    if (!request.buffer || request.buffer.length === 0) {
      throw new AppError('Image buffer cannot be empty', {
        code: 'VALIDATION_ERROR',
        statusCode: 400
      });
    }
  }
}
