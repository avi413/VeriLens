export declare class BlockchainSigningClient {
    private readonly keySecretName;
    private readonly privateKey;
    private readonly queue;
    constructor(keySecretName?: string);
    sign(payload: Buffer | string): Promise<string>;
    private parseKey;
    private executeSigning;
}
