"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryQueue = void 0;
const logger_1 = require("../shared/logger");
const errors_1 = require("../shared/errors");
const logger = (0, logger_1.getLogger)('blockchain:retry-queue');
class RetryQueue {
    handler;
    maxRetries;
    baseDelayMs;
    onFailure;
    queue = [];
    processing = false;
    constructor(handler, maxRetries = 5, baseDelayMs = 500, onFailure) {
        this.handler = handler;
        this.maxRetries = maxRetries;
        this.baseDelayMs = baseDelayMs;
        this.onFailure = onFailure;
    }
    enqueue(payload) {
        this.queue.push({ payload, attempt: 0 });
        this.process();
    }
    async process() {
        if (this.processing)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            try {
                await this.handler(job.payload);
                logger.info('Job processed successfully');
            }
            catch (error) {
                job.attempt += 1;
                if (job.attempt > this.maxRetries) {
                    const err = new errors_1.AppError('Retry queue exhausted', {
                        code: 'BLOCKCHAIN_SIGNING_FAILED',
                        cause: error
                    });
                    logger.error('Job exceeded retries', { message: err.message });
                    this.onFailure?.(job.payload, err);
                    continue;
                }
                const delay = this.backoff(job.attempt);
                logger.warn('Retrying job', { attempt: job.attempt, delay });
                await wait(delay);
                this.queue.unshift(job);
            }
        }
        this.processing = false;
    }
    backoff(attempt) {
        const jitter = Math.floor(Math.random() * this.baseDelayMs);
        return this.baseDelayMs * Math.pow(2, attempt - 1) + jitter;
    }
}
exports.RetryQueue = RetryQueue;
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
