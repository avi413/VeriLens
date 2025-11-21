import { getLogger } from '../shared/logger';
import { AppError } from '../shared/errors';

type RetryHandler<T> = (payload: T) => Promise<void>;
type FailureHandler<T> = (payload: T, error: Error) => void;

type QueueJob<T> = {
  payload: T;
  attempt: number;
};

const logger = getLogger('blockchain:retry-queue');

export class RetryQueue<T> {
  private queue: QueueJob<T>[] = [];
  private processing = false;

  constructor(
    private readonly handler: RetryHandler<T>,
    private readonly maxRetries = 5,
    private readonly baseDelayMs = 500,
    private readonly onFailure?: FailureHandler<T>
  ) {}

  enqueue(payload: T) {
    this.queue.push({ payload, attempt: 0 });
    this.process();
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        await this.handler(job.payload);
        logger.info('Job processed successfully');
      } catch (error) {
        job.attempt += 1;
          if (job.attempt > this.maxRetries) {
            const err = new AppError('Retry queue exhausted', {
              code: 'BLOCKCHAIN_SIGNING_FAILED',
              cause: error as Error
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

  private backoff(attempt: number) {
    const jitter = Math.floor(Math.random() * this.baseDelayMs);
    return this.baseDelayMs * Math.pow(2, attempt - 1) + jitter;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
