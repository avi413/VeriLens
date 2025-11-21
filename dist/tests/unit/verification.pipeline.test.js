"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pipeline_1 = require("../../app/verification/pipeline");
jest.mock('../../app/verification/metadataExtractor', () => ({
    extractMetadata: jest.fn(() => ({
        deviceMake: 'Veri',
        deviceModel: 'Lens One',
        iso: 100,
        exposureTime: 0.01,
        fNumber: 1.8,
        timestamp: new Date().toISOString(),
        latitude: 35.0,
        longitude: -120.0
    }))
}));
jest.mock('../../app/verification/depthAnalyzer', () => ({
    scoreDepthFrame: jest.fn(() => ({
        variance: 10,
        mean: 50,
        confidence: 0.9
    }))
}));
describe('verification pipeline', () => {
    it('returns pass verdict when metadata and depth are strong', async () => {
        const result = await (0, pipeline_1.runVerification)({
            imageBuffer: Buffer.from('fake-image'),
            depthFrame: {
                width: 2,
                height: 2,
                values: [10, 20, 30, 40]
            },
            expectedDeviceId: 'lens'
        });
        expect(result.verdict).toBe('pass');
        expect(result.exifScore).toBeGreaterThan(0.8);
        expect(result.depthScore?.confidence).toBe(0.9);
    });
});
