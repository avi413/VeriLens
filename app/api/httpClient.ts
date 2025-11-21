import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { loadConfig } from '../../config/environment';
import { getLogger } from '../shared/logger';
import { AppError } from '../shared/errors';

const config = loadConfig();
const logger = getLogger('api:client');

export class ApiClient {
  private readonly client: AxiosInstance;

  constructor(private readonly tokenProvider?: () => string | undefined) {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.requestTimeoutMs
    });

    this.client.interceptors.request.use((request) => {
      request.headers = request.headers ?? {};
      request.headers['x-request-id'] = request.headers['x-request-id'] ?? cryptoRandomId();

      const token = this.tokenProvider?.();
      if (token) {
        request.headers.Authorization = `Bearer ${token}`;
      }

      logger.debug('HTTP request', { url: request.url, method: request.method });
      return request;
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('HTTP response', { url: response.config.url, status: response.status });
        return response;
      },
      (error) => {
        logger.error('HTTP error', { message: error.message, url: error.config?.url });
        return Promise.reject(error);
      }
    );
  }

  async request<T = unknown>(request: AxiosRequestConfig, retries = config.api.maxRetries) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.client.request<T>(request);
        return response.data;
      } catch (error) {
        if (attempt === retries) {
          throw new AppError('API request failed', {
            code: 'UNKNOWN',
            cause: error as Error,
            details: { request }
          });
        }

        const delay = backoffMs(attempt);
        logger.warn('Retrying API request', { attempt: attempt + 1, delay });
        await wait(delay);
      }
    }
    throw new AppError('API request exhausted retries');
  }
}

function cryptoRandomId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

function backoffMs(attempt: number) {
  const base = 200 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 100);
  return base + jitter;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
