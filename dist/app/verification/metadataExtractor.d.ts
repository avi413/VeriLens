export type MetadataSummary = {
    deviceMake?: string;
    deviceModel?: string;
    iso?: number;
    exposureTime?: number;
    fNumber?: number;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    timestamp?: string;
    orientation?: number;
};
export declare function extractMetadata(buffer: Buffer): MetadataSummary;
