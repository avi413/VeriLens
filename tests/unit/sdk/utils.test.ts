import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalizeError } from '@verilens/sdk/utils/errorNormalizer';
import {
  assertValidSdkConfig,
  validateSdkConfig,
} from '@verilens/sdk/utils/validators';
import loadSdkConfig from '@verilens/sdk/utils/configLoader';

describe('SDK utilities', () => {
  it('normalizes native Error instances', () => {
    const normalized = normalizeError(new Error('boom'), { hint: 'test' });
    expect(normalized).toMatchObject({
      name: 'Error',
      message: 'boom',
      details: { hint: 'test' },
    });
  });

  it('reports validation issues for malformed configs', () => {
    const issues = validateSdkConfig(null);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'root' }),
      ])
    );
  });

  it('loads and merges config files from disk', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verilens-config-'));
    try {
      fs.writeFileSync(
        path.join(tmpDir, 'default.json'),
        JSON.stringify({
          env: 'development',
          version: '0.0.0',
          blockchain: { defaultChainId: 'local' },
        })
      );
      fs.writeFileSync(
        path.join(tmpDir, 'test.json'),
        JSON.stringify({
          env: 'test',
          version: '0.0.0',
          blockchain: { defaultChainId: 'testnet' },
        })
      );

      const config = loadSdkConfig({ env: 'test', searchPaths: [tmpDir] });
      expect(config.env).toBe('test');
      expect(config.blockchain?.defaultChainId).toBe('testnet');
      expect(config.version).toBe('0.0.0');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('asserts valid configuration', () => {
    expect(() =>
      assertValidSdkConfig({
        env: 'dev',
        version: '0.0.1',
        blockchain: { defaultChainId: 'local' },
      })
    ).not.toThrow();
  });
});
