import { LoggerConfig, MetadataRecord } from '../types';

const LEVEL_PRIORITY: Record<Exclude<LoggerConfig['level'], undefined>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

/**
 * Lightweight logging facade that can forward events to console or custom emitters.
 */
export class SdkLogger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = { level: 'info', namespace: 'verilens' }) {
    this.config = { level: 'info', namespace: 'verilens', ...config };
  }

  configure(nextConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...nextConfig };
  }

  debug(message: string, context?: MetadataRecord): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: MetadataRecord): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: MetadataRecord): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: MetadataRecord): void {
    this.log('error', message, context);
  }

  private log(
    level: Exclude<LoggerConfig['level'], undefined>,
    message: string,
    context?: MetadataRecord
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.namespace}] [${level.toUpperCase()}]`;

    if (this.config.destination === 'custom' && this.config.emitter) {
      this.config.emitter(level, message, context);
      return;
    }

    // TODO: Replace console usage with pluggable transports in production builds.
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](`${prefix} ${message}`, context ?? '');
  }

  private shouldLog(level: Exclude<LoggerConfig['level'], undefined>): boolean {
    const configuredLevel = this.config.level ?? 'info';
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configuredLevel];
  }
}

export default SdkLogger;
