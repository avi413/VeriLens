import { LoggerConfig, MetadataRecord } from '../types';
/**
 * Lightweight logging facade that can forward events to console or custom emitters.
 */
export declare class SdkLogger {
    private config;
    constructor(config?: LoggerConfig);
    configure(nextConfig: Partial<LoggerConfig>): void;
    debug(message: string, context?: MetadataRecord): void;
    info(message: string, context?: MetadataRecord): void;
    warn(message: string, context?: MetadataRecord): void;
    error(message: string, context?: MetadataRecord): void;
    private log;
    private shouldLog;
}
export default SdkLogger;
