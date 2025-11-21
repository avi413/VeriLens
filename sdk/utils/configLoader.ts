import fs from 'node:fs';
import path from 'node:path';
import {
  ConfigLoaderOptions,
  DeepPartial,
  MetadataRecord,
  SdkConfig,
} from '../types';
import { assertValidSdkConfig, isRecord } from './validators';
import { normalizeError } from './errorNormalizer';
import SdkLogger from './logger';

const DEFAULT_SEARCH_PATHS = [
  path.resolve(process.cwd(), 'config/sdk'),
  path.resolve(process.cwd(), 'config'),
  path.resolve(__dirname, '../../config'),
];

/**
 * Load SDK configuration by merging `default.json`, environment-specific files, and programmatic overrides.
 */
export function loadSdkConfig(
  options: ConfigLoaderOptions = {},
  logger = new SdkLogger({ namespace: 'verilens:config', level: 'info' })
): SdkConfig {
  const env = options.env ?? process.env.VERILENS_ENV ?? 'development';
  const searchPaths = options.searchPaths ?? DEFAULT_SEARCH_PATHS;
  const candidates = ['default.json', `${env}.json`];

  let config: DeepPartial<SdkConfig> = {};

  for (const dir of searchPaths) {
    for (const fileName of candidates) {
      const absolutePath = path.join(dir, fileName);
      if (!fs.existsSync(absolutePath)) {
        continue;
      }

      try {
        const raw = fs.readFileSync(absolutePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) {
          logger.warn(`Skipping config file ${absolutePath} because it does not contain an object.`);
          continue;
        }

        config = deepMerge(config, parsed as DeepPartial<SdkConfig>);
      } catch (error) {
        logger.error(`Failed to parse config file ${absolutePath}`, {
          error: normalizeError(error, { fileName: absolutePath }),
        } satisfies MetadataRecord);
      }
    }
  }

  config = deepMerge(config, options.overrides ?? {});

  const finalConfig: SdkConfig = {
    env,
    version: '0.0.0',
    ...config,
  } as SdkConfig;

  assertValidSdkConfig(finalConfig);
  return finalConfig;
}

function deepMerge<T extends Record<string, unknown>>(
  target: DeepPartial<T>,
  source: DeepPartial<T>
): DeepPartial<T> {
  const output: DeepPartial<T> = { ...target };

  Object.entries(source).forEach(([key, value]) => {
    const existing = output[key as keyof T];
    const targetRef = output as unknown as Record<string, unknown>;

    targetRef[key] =
      isRecord(existing) && isRecord(value)
        ? deepMerge(
            existing as DeepPartial<Record<string, unknown>>,
            value as DeepPartial<Record<string, unknown>>
          )
        : value;
  });

  return output;
}

export default loadSdkConfig;
