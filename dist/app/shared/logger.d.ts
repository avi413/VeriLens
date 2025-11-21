type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export declare class Logger {
    private readonly scope;
    private readonly level;
    constructor(scope: string, level?: LogLevel);
    child(childScope: string): Logger;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
    private log;
}
export declare const rootLogger: Logger;
export declare const getLogger: (scope: string) => Logger;
export {};
