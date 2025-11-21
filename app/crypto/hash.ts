import crypto from 'crypto';
import fs from 'fs';

export function sha256(input: Buffer | string): string {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

export async function sha256File(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(path);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
