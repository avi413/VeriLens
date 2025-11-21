import crypto from 'crypto';
import { RetryQueue } from './retryQueue';
import { sha256 } from '../crypto/hash';
import { getSecret } from '../shared/secrets';
import { loadConfig } from '../../config/environment';
import { getLogger } from '../shared/logger';
import { AppError } from '../shared/errors';

const config = loadConfig();
const logger = getLogger('blockchain:signing');

type SigningJob = {
  data: Buffer;
  resolve: (signature: string) => void;
  reject: (error: Error) => void;
};

export class BlockchainSigningClient {
  private readonly privateKey: crypto.KeyObject;
  private readonly queue: RetryQueue<SigningJob>;

  constructor(private readonly keySecretName = 'blockchainPrivateKey') {
    const secret = getSecret(keySecretName);
    this.privateKey = this.parseKey(secret);
    this.queue = new RetryQueue<SigningJob>(
      async (job) => {
        const signature = await this.executeSigning(job.data);
        job.resolve(signature);
      },
      config.blockchain.maxRetries,
      500,
      (job, error) => job.reject(error)
    );
  }

  async sign(payload: Buffer | string): Promise<string> {
    const data = typeof payload === 'string' ? Buffer.from(payload) : payload;
    return new Promise<string>((resolve, reject) => {
      this.queue.enqueue({ data, resolve, reject });
    });
  }

  private parseKey(secret: string): crypto.KeyObject {
    try {
      const pem = secret.includes('BEGIN') ? secret : Buffer.from(secret, 'base64').toString('utf-8');
      return crypto.createPrivateKey({
        key: pem,
        format: 'pem',
        type: 'pkcs8'
      });
    } catch (error) {
      throw new AppError('Unable to load blockchain signing key', {
        code: 'CONFIGURATION_ERROR',
        cause: error as Error
      });
    }
  }

  private async executeSigning(data: Buffer): Promise<string> {
    const digest = sha256(data);

    try {
      const signer = crypto.createSign('SHA256');
      signer.update(Buffer.from(digest, 'hex'));
      signer.end();

      const signature = signer.sign(this.privateKey).toString('hex');
      logger.info('Payload signed', { digest });
      return signature;
    } catch (error) {
      logger.error('Signing failed', { message: (error as Error).message });
      throw new AppError('Blockchain signing failed', {
        code: 'BLOCKCHAIN_SIGNING_FAILED',
        cause: error as Error
      });
    }
  }
}
