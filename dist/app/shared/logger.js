"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = exports.rootLogger = exports.Logger = void 0;
const environment_1 = require("../../config/environment");
const levelRank = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};
const { logging } = (0, environment_1.loadConfig)();
const globalLevel = logging.level;
class Logger {
    scope;
    level;
    constructor(scope, level = globalLevel) {
        this.scope = scope;
        this.level = level;
    }
    child(childScope) {
        return new Logger(`${this.scope}:${childScope}`, this.level);
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
exports.Logger = Logger;
exports.rootLogger = new Logger('verilens');
const getLogger = (scope) => exports.rootLogger.child(scope);
exports.getLogger = getLogger;
