import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { loadConfig } from '../../config/environment';
import { getLogger } from '../shared/logger';
import { AppError } from '../shared/errors';

const config = loadConfig();
const logger = getLogger('crypto:encryption');

export type EncryptedPayload = {
  iv: string;
  authTag: string;
  ciphertext: string;
};

export function encryptBuffer(buffer: Buffer, key: Buffer): EncryptedPayload {
  if (key.length !== 32) {
    throw new AppError('Encryption key must be 32 bytes for AES-256-GCM', {
      code: 'CONFIGURATION_ERROR',
    });
  }

  const iv = crypto.randomBytes(config.encryption.ivLength);
  const cipher = crypto.createCipheriv(
    config.encryption.algorithm,
    key,
    iv
  ) as crypto.CipherGCM;

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: encrypted.toString('base64'),
  };
}

export function decryptBuffer(payload: EncryptedPayload, key: Buffer): Buffer {
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');
  const ciphertext = Buffer.from(payload.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv(
    config.encryption.algorithm,
    key,
    iv
  ) as crypto.DecipherGCM;
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function writeEncryptedFile(
  fileName: string,
  buffer: Buffer,
  key: Buffer
) {
  const encrypted = encryptBuffer(buffer, key);
  const payload = JSON.stringify(encrypted, null, 2);

  const dir = path.resolve(process.cwd(), config.storage.encryptedImageDir);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${fileName}.enc.json`);
  fs.writeFileSync(filePath, payload, { mode: 0o600 });
  logger.info('Encrypted image persisted', { filePath });
}
