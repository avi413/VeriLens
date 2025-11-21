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
export declare function scoreDepthFrame(frame: DepthFrame): DepthScore;
