import { AxiosRequestConfig } from 'axios';
export declare class ApiClient {
    private readonly tokenProvider?;
    private readonly client;
    constructor(tokenProvider?: (() => string | undefined) | undefined);
    request<T = unknown>(request: AxiosRequestConfig, retries?: number): Promise<T>;
}
