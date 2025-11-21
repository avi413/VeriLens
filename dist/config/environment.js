"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let cachedConfig = null;
const CONFIG_DIR = __dirname;
function loadConfig(env = process.env.NODE_ENV ?? 'development') {
    if (cachedConfig)
        return cachedConfig;
    const defaultConfig = readConfigFile('default');
    const envConfig = readConfigFile(env, false);
    const merged = deepMerge(defaultConfig, envConfig ?? {});
    cachedConfig = merged;
    return merged;
}
function readConfigFile(name, required = true) {
    const filePath = path_1.default.join(CONFIG_DIR, `${name}.json`);
    if (!fs_1.default.existsSync(filePath)) {
        if (required) {
            throw new Error(`Configuration file not found: ${filePath}`);
        }
        return {};
    }
    const raw = fs_1.default.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}
function isPlainObject(value) {
    if (value === null || typeof value !== 'object')
        return false;
    if (Array.isArray(value))
        return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}
function deepMerge(base, override) {
    const output = { ...base };
    for (const [key, value] of Object.entries(override ?? {})) {
        if (isPlainObject(value) && isPlainObject(output[key])) {
            output[key] = deepMerge(output[key], value);
        }
        else if (value !== undefined) {
            output[key] = value;
        }
    }
    return output;
}
