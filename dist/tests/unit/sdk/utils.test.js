"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const errorNormalizer_1 = require("@verilens/sdk/utils/errorNormalizer");
const validators_1 = require("@verilens/sdk/utils/validators");
const configLoader_1 = __importDefault(require("@verilens/sdk/utils/configLoader"));
describe('SDK utilities', () => {
    it('normalizes native Error instances', () => {
        const normalized = (0, errorNormalizer_1.normalizeError)(new Error('boom'), { hint: 'test' });
        expect(normalized).toMatchObject({
            name: 'Error',
            message: 'boom',
            details: { hint: 'test' },
        });
    });
    it('reports validation issues for malformed configs', () => {
        const issues = (0, validators_1.validateSdkConfig)(null);
        expect(issues).toEqual(expect.arrayContaining([
            expect.objectContaining({ field: 'root' }),
        ]));
    });
    it('loads and merges config files from disk', () => {
        const tmpDir = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'verilens-config-'));
        try {
            node_fs_1.default.writeFileSync(node_path_1.default.join(tmpDir, 'default.json'), JSON.stringify({
                env: 'development',
                version: '0.0.0',
                blockchain: { defaultChainId: 'local' },
            }));
            node_fs_1.default.writeFileSync(node_path_1.default.join(tmpDir, 'test.json'), JSON.stringify({
                env: 'test',
                version: '0.0.0',
                blockchain: { defaultChainId: 'testnet' },
            }));
            const config = (0, configLoader_1.default)({ env: 'test', searchPaths: [tmpDir] });
            expect(config.env).toBe('test');
            expect(config.blockchain?.defaultChainId).toBe('testnet');
            expect(config.version).toBe('0.0.0');
        }
        finally {
            node_fs_1.default.rmSync(tmpDir, { recursive: true, force: true });
        }
    });
    it('asserts valid configuration', () => {
        expect(() => (0, validators_1.assertValidSdkConfig)({
            env: 'dev',
            version: '0.0.1',
            blockchain: { defaultChainId: 'local' },
        })).not.toThrow();
    });
});
