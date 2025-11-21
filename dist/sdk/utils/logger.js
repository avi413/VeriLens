"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkLogger = void 0;
const LEVEL_PRIORITY = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
    silent: 50,
};
/**
 * Lightweight logging facade that can forward events to console or custom emitters.
 */
class SdkLogger {
    config;
    constructor(config = { level: 'info', namespace: 'verilens' }) {
        this.config = { level: 'info', namespace: 'verilens', ...config };
    }
    configure(nextConfig) {
        this.config = { ...this.config, ...nextConfig };
    }
    debug(message, context) {
        this.log('debug', message, context);
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, context) {
        this.log('error', message, context);
    }
    log(level, message, context) {
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
        const consoleMethod = level === 'debug' || level === 'silent' ? 'log' : level;
        // eslint-disable-next-line no-console
        console[consoleMethod](`${prefix} ${message}`, context ?? '');
    }
    shouldLog(level) {
        const configuredLevel = this.config.level ?? 'info';
        return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configuredLevel];
    }
}
exports.SdkLogger = SdkLogger;
exports.default = SdkLogger;
