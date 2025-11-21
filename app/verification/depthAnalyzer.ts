import { AppError } from '../shared/errors';

export type DepthFrame = {
  width: number;
  height: number;
  values: number[];
};

export type DepthScore = {
  variance: number;
  mean: number;
  confidence: number;
};

export function scoreDepthFrame(frame: DepthFrame): DepthScore {
  if (frame.values.length !== frame.width * frame.height) {
    throw new AppError('Depth frame dimensions mismatch', {
      code: 'VALIDATION_ERROR'
    });
  }

  const mean = frame.values.reduce((acc, val) => acc + val, 0) / frame.values.length;
  const variance =
    frame.values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / frame.values.length;

  const normalizedVariance = Math.min(variance / 1000, 1);
  const confidence = 1 - normalizedVariance;

  return {
    variance,
    mean,
    confidence: Number(confidence.toFixed(4))
  };
}
