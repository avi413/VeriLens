type RetryHandler<T> = (payload: T) => Promise<void>;
type FailureHandler<T> = (payload: T, error: Error) => void;
export declare class RetryQueue<T> {
    private readonly handler;
    private readonly maxRetries;
    private readonly baseDelayMs;
    private readonly onFailure?;
    private queue;
    private processing;
    constructor(handler: RetryHandler<T>, maxRetries?: number, baseDelayMs?: number, onFailure?: FailureHandler<T> | undefined);
    enqueue(payload: T): void;
    private process;
    private backoff;
}
export {};
