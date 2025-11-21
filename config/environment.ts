import fs from 'fs';
import path from 'path';

export type AppConfig = {
  api: {
    baseUrl: string;
    requestTimeoutMs: number;
    maxRetries: number;
  };
  blockchain: {
    endpoint: string;
    signingTimeoutMs: number;
    maxRetries: number;
  };
  encryption: {
    algorithm: string;
    keyEnvVar: string;
    ivLength: number;
  };
  storage: {
    encryptedImageDir: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
};

let cachedConfig: AppConfig | null = null;

const CONFIG_DIR = __dirname;

export function loadConfig(env = process.env.NODE_ENV ?? 'development'): AppConfig {
  if (cachedConfig) return cachedConfig;

  const defaultConfig = readConfigFile<AppConfig>('default');
  const envConfig = readConfigFile<Partial<AppConfig>>(env, false);

  const merged = deepMerge<AppConfig>(defaultConfig, envConfig ?? {});
  cachedConfig = merged;
  return merged;
}

function readConfigFile<T extends Record<string, any>>(name: string, required = true): T {
  const filePath = path.join(CONFIG_DIR, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    if (required) {
      throw new Error(`Configuration file not found: ${filePath}`);
    }
    return {} as T;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepMerge<T extends Record<string, any>>(base: T, override: Partial<T>): T {
  const output: Record<string, any> = { ...(base as Record<string, any>) };

  for (const [key, value] of Object.entries(override ?? {})) {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMerge(output[key], value as Record<string, any>);
    } else if (value !== undefined) {
      output[key] = value;
    }
  }

  return output as T;
}
