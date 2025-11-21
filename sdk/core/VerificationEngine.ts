import IVerificationPipeline from '../interfaces/IVerificationPipeline';
import {
  VerificationInput,
  VerificationResult,
  VerificationStage,
  VerificationStageResult,
} from '../types';

/**
 * Composable verification orchestrator. Executes stages sequentially and aggregates telemetry.
 */
export class VerificationEngine implements IVerificationPipeline {
  private readonly stages: VerificationStage[] = [];
  private latestResults: VerificationStageResult[] = [];

  registerStage(stage: VerificationStage): void {
    // TODO: Add validation to avoid duplicate stage IDs and manage ordering constraints.
    this.stages.push(stage);
  }

  async runVerification(input: VerificationInput): Promise<VerificationResult> {
    // TODO: Add tracing, cancellation tokens, and parallel stage support.
    const runResults: VerificationStageResult[] = [];

    for (const stage of this.stages) {
      const startedAt = Date.now();
      try {
        const result = await stage.execute(input);
        runResults.push({
          ...result,
          durationMs: result.durationMs ?? Date.now() - startedAt,
        });

        if (!result.success) {
          break;
        }
      } catch (error) {
        runResults.push({
          stageId: stage.id,
          success: false,
          summary: 'Stage execution failed',
          error: {
            name: (error as Error).name ?? 'Error',
            message: (error as Error).message,
          },
          durationMs: Date.now() - startedAt,
        });
        break;
      }
    }

    this.latestResults = runResults;

    return {
      success: runResults.every((result) => result.success),
      stages: runResults,
      generatedAt: new Date(),
    };
  }

  getStageResults(): VerificationStageResult[] {
    // TODO: Provide immutable copies or observable streams for consumers.
    return [...this.latestResults];
  }
}

export default VerificationEngine;
