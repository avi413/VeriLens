import { loadConfig } from '../../config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const { logging } = loadConfig();
const globalLevel: LogLevel = logging.level;

export class Logger {
  constructor(private readonly scope: string, private readonly level: LogLevel = globalLevel) {}

  child(childScope: string): Logger {
    return new Logger(`${this.scope}:${childScope}`, this.level);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (levelRank[level] < levelRank[this.level]) {
      return;
    }

    const payload = {
      level,
      scope: this.scope,
      message,
      timestamp: new Date().toISOString(),
      ...context
    };

    const serialized = JSON.stringify(payload);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(serialized);
        break;
      case 'warn':
        console.warn(serialized);
        break;
      case 'error':
        console.error(serialized);
        break;
    }
  }
}

export const rootLogger = new Logger('verilens');
export const getLogger = (scope: string) => rootLogger.child(scope);
