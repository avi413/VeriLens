"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSdkConfig = loadSdkConfig;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const validators_1 = require("./validators");
const errorNormalizer_1 = require("./errorNormalizer");
const logger_1 = __importDefault(require("./logger"));
const DEFAULT_SEARCH_PATHS = [
    node_path_1.default.resolve(process.cwd(), 'config/sdk'),
    node_path_1.default.resolve(process.cwd(), 'config'),
    node_path_1.default.resolve(__dirname, '../../config'),
];
/**
 * Load SDK configuration by merging `default.json`, environment-specific files, and programmatic overrides.
 */
function loadSdkConfig(options = {}, logger = new logger_1.default({ namespace: 'verilens:config', level: 'info' })) {
    const env = options.env ?? process.env.VERILENS_ENV ?? 'development';
    const searchPaths = options.searchPaths ?? DEFAULT_SEARCH_PATHS;
    const candidates = ['default.json', `${env}.json`];
    let config = {};
    for (const dir of searchPaths) {
        for (const fileName of candidates) {
            const absolutePath = node_path_1.default.join(dir, fileName);
            if (!node_fs_1.default.existsSync(absolutePath)) {
                continue;
            }
            try {
                const raw = node_fs_1.default.readFileSync(absolutePath, 'utf-8');
                const parsed = JSON.parse(raw);
                if (!(0, validators_1.isRecord)(parsed)) {
                    logger.warn(`Skipping config file ${absolutePath} because it does not contain an object.`);
                    continue;
                }
                config = deepMerge(config, parsed);
            }
            catch (error) {
                logger.error(`Failed to parse config file ${absolutePath}`, {
                    error: (0, errorNormalizer_1.normalizeError)(error, { fileName: absolutePath }),
                });
            }
        }
    }
    config = deepMerge(config, options.overrides ?? {});
    const finalConfig = {
        env,
        version: '0.0.0',
        ...config,
    };
    (0, validators_1.assertValidSdkConfig)(finalConfig);
    return finalConfig;
}
function deepMerge(target, source) {
    const output = { ...target };
    Object.entries(source).forEach(([key, value]) => {
        const existing = output[key];
        const targetRef = output;
        targetRef[key] =
            (0, validators_1.isRecord)(existing) && (0, validators_1.isRecord)(value)
                ? deepMerge(existing, value)
                : value;
    });
    return output;
}
exports.default = loadSdkConfig;
