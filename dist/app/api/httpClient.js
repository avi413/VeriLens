"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const environment_1 = require("../../config/environment");
const logger_1 = require("../shared/logger");
const errors_1 = require("../shared/errors");
const config = (0, environment_1.loadConfig)();
const logger = (0, logger_1.getLogger)('api:client');
class ApiClient {
    tokenProvider;
    client;
    constructor(tokenProvider) {
        this.tokenProvider = tokenProvider;
        this.client = axios_1.default.create({
            baseURL: config.api.baseUrl,
            timeout: config.api.requestTimeoutMs,
        });
        this.client.interceptors.request.use((request) => {
            request.headers = request.headers ?? {};
            request.headers['x-request-id'] =
                request.headers['x-request-id'] ?? cryptoRandomId();
            const token = this.tokenProvider?.();
            if (token) {
                request.headers.Authorization = `Bearer ${token}`;
            }
            logger.debug('HTTP request', {
                url: request.url,
                method: request.method,
            });
            return request;
        });
        this.client.interceptors.response.use((response) => {
            logger.debug('HTTP response', {
                url: response.config.url,
                status: response.status,
            });
            return response;
        }, (error) => {
            logger.error('HTTP error', {
                message: error.message,
                url: error.config?.url,
            });
            return Promise.reject(error);
        });
    }
    async request(request, retries = config.api.maxRetries) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await this.client.request(request);
                return response.data;
            }
            catch (error) {
                if (attempt === retries) {
                    throw new errors_1.AppError('API request failed', {
                        code: 'UNKNOWN',
                        cause: error,
                        details: { request },
                    });
                }
                const delay = backoffMs(attempt);
                logger.warn('Retrying API request', { attempt: attempt + 1, delay });
                await wait(delay);
            }
        }
        throw new errors_1.AppError('API request exhausted retries');
    }
}
exports.ApiClient = ApiClient;
function cryptoRandomId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function backoffMs(attempt) {
    const base = 200 * Math.pow(2, attempt);
    const jitter = Math.floor(Math.random() * 100);
    return base + jitter;
}
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// Main function to make this file executable
async function main() {
    logger.info('VeriLens API Client initialized', {
        baseUrl: config.api.baseUrl,
        timeout: config.api.requestTimeoutMs,
    });
    // Create a sample client
    const client = new ApiClient();
    logger.info('VeriLens development server ready');
    logger.info('Available components:');
    logger.info('- API Client with retry logic and auth support');
    logger.info('- Cryptographic hashing and encryption');
    logger.info('- Metadata extraction and verification pipeline');
    logger.info('- Blockchain signing capabilities');
    console.log('\n✅ VeriLens framework is ready for development!');
    console.log('💡 Check the SDK examples in sdk/examples/ for usage patterns');
    console.log('📚 See docs/ for architecture and verification pipeline details\n');
}
// Run main if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        logger.error('Failed to start VeriLens', { error: error.message });
        process.exit(1);
    });
}
