"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreDepthFrame = scoreDepthFrame;
const errors_1 = require("../shared/errors");
function scoreDepthFrame(frame) {
    if (frame.values.length !== frame.width * frame.height) {
        throw new errors_1.AppError('Depth frame dimensions mismatch', {
            code: 'VALIDATION_ERROR'
        });
    }
    const mean = frame.values.reduce((acc, val) => acc + val, 0) / frame.values.length;
    const variance = frame.values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / frame.values.length;
    const normalizedVariance = Math.min(variance / 1000, 1);
    const confidence = 1 - normalizedVariance;
    return {
        variance,
        mean,
        confidence: Number(confidence.toFixed(4))
    };
}
