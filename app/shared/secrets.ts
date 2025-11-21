import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getLogger } from './logger';
import { AppError } from './errors';

const logger = getLogger('secrets');

const DEFAULT_SECRETS_PATH = path.resolve(process.cwd(), 'config', 'secrets.json');

type SecretSource = 'env' | 'file';

interface SecretOptions {
  path?: string;
  decrypt?: boolean;
  encryptionKeyEnv?: string;
}

function readSecretsFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    throw new AppError(`Secrets file not found at ${filePath}`, {
      code: 'CONFIGURATION_ERROR'
    });
  }

  const buffer = fs.readFileSync(filePath);
  if (buffer.length === 0) {
    return {};
  }

  return JSON.parse(buffer.toString('utf-8'));
}

function decryptValue(value: string, key: Buffer) {
  const data = Buffer.from(value, 'base64');
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf-8');
}

export function getSecret(key: string, options: SecretOptions = {}): string {
  const { path: secretsPath, decrypt, encryptionKeyEnv = 'SECRET_DECRYPTION_KEY' } = options;

  if (process.env[key]) {
    logger.debug(`Secret "${key}" served from env`, { source: 'env' satisfies SecretSource });
    return process.env[key] as string;
  }

  const resolvedPath = secretsPath ?? process.env.SECRETS_PATH ?? DEFAULT_SECRETS_PATH;
  const secrets = readSecretsFile(resolvedPath);

  if (!(key in secrets)) {
    throw new AppError(`Secret ${key} not found`, { code: 'CONFIGURATION_ERROR' });
  }

  let value = secrets[key];
  if (decrypt) {
    const encryptionKey = process.env[encryptionKeyEnv];
    if (!encryptionKey) {
      throw new AppError(`Missing encryption key env "${encryptionKeyEnv}"`, {
        code: 'CONFIGURATION_ERROR'
      });
    }
    value = decryptValue(value, Buffer.from(encryptionKey, 'base64'));
  }

  logger.debug(`Secret "${key}" served from file`, { source: 'file' satisfies SecretSource });
  return value;
}
