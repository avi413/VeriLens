export type AppConfig = {
    api: {
        baseUrl: string;
        requestTimeoutMs: number;
        maxRetries: number;
    };
    blockchain: {
        endpoint: string;
        signingTimeoutMs: number;
        maxRetries: number;
    };
    encryption: {
        algorithm: string;
        keyEnvVar: string;
        ivLength: number;
    };
    storage: {
        encryptedImageDir: string;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
    };
};
export declare function loadConfig(env?: string): AppConfig;
