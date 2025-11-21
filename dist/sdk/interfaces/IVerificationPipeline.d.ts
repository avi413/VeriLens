import { VerificationInput, VerificationResult, VerificationStage, VerificationStageResult } from '../types';
/**
 * Coordinates the end-to-end verification workflow executed by the SDK.
 */
export interface IVerificationPipeline {
    /**
     * Register a new stage that will be executed in order of registration.
     */
    registerStage(stage: VerificationStage): void;
    /**
      * Execute all configured stages and produce a consolidated verification result.
      */
    runVerification(input: VerificationInput): Promise<VerificationResult>;
    /**
     * Retrieve the latest individual stage results (useful for UI progress or debugging).
     */
    getStageResults(): VerificationStageResult[];
}
export default IVerificationPipeline;
