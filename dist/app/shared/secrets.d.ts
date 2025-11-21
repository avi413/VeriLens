interface SecretOptions {
    path?: string;
    decrypt?: boolean;
    encryptionKeyEnv?: string;
}
export declare function getSecret(key: string, options?: SecretOptions): string;
export {};
