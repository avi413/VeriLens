"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationEngine = void 0;
/**
 * Composable verification orchestrator. Executes stages sequentially and aggregates telemetry.
 */
class VerificationEngine {
    stages = [];
    latestResults = [];
    registerStage(stage) {
        // TODO: Add validation to avoid duplicate stage IDs and manage ordering constraints.
        this.stages.push(stage);
    }
    async runVerification(input) {
        // TODO: Add tracing, cancellation tokens, and parallel stage support.
        const runResults = [];
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
            }
            catch (error) {
                runResults.push({
                    stageId: stage.id,
                    success: false,
                    summary: 'Stage execution failed',
                    error: {
                        name: error.name ?? 'Error',
                        message: error.message,
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
    getStageResults() {
        // TODO: Provide immutable copies or observable streams for consumers.
        return [...this.latestResults];
    }
}
exports.VerificationEngine = VerificationEngine;
exports.default = VerificationEngine;
