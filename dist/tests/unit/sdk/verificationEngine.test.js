"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VerificationEngine_1 = require("@verilens/sdk/core/VerificationEngine");
const baseInput = {
    image: {
        id: 'img-1',
        uri: 'file://sample.jpg',
        capturedAt: new Date(),
    },
};
describe('VerificationEngine', () => {
    it('executes stages sequentially and stops after failure', async () => {
        const engine = new VerificationEngine_1.VerificationEngine();
        const executedStages = [];
        engine.registerStage({
            id: 'stage-a',
            description: 'first',
            async execute() {
                executedStages.push('stage-a');
                return {
                    stageId: 'stage-a',
                    success: true,
                    summary: 'ok',
                };
            },
        });
        engine.registerStage({
            id: 'stage-b',
            description: 'fails',
            async execute() {
                executedStages.push('stage-b');
                return {
                    stageId: 'stage-b',
                    success: false,
                    summary: 'failure',
                };
            },
        });
        engine.registerStage({
            id: 'stage-c',
            description: 'should not run',
            async execute() {
                executedStages.push('stage-c');
                return {
                    stageId: 'stage-c',
                    success: true,
                    summary: 'skipped',
                };
            },
        });
        const result = await engine.runVerification(baseInput);
        expect(result.success).toBe(false);
        expect(result.stages).toHaveLength(2);
        expect(executedStages).toEqual(['stage-a', 'stage-b']);
        expect(engine.getStageResults()).toHaveLength(2);
    });
});
