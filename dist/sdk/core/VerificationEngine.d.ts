import IVerificationPipeline from '../interfaces/IVerificationPipeline';
import { VerificationInput, VerificationResult, VerificationStage, VerificationStageResult } from '../types';
/**
 * Composable verification orchestrator. Executes stages sequentially and aggregates telemetry.
 */
export declare class VerificationEngine implements IVerificationPipeline {
    private readonly stages;
    private latestResults;
    registerStage(stage: VerificationStage): void;
    runVerification(input: VerificationInput): Promise<VerificationResult>;
    getStageResults(): VerificationStageResult[];
}
export default VerificationEngine;
