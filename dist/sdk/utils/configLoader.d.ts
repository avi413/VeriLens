import { ConfigLoaderOptions, SdkConfig } from '../types';
import SdkLogger from './logger';
/**
 * Load SDK configuration by merging `default.json`, environment-specific files, and programmatic overrides.
 */
export declare function loadSdkConfig(options?: ConfigLoaderOptions, logger?: SdkLogger): SdkConfig;
export default loadSdkConfig;
