// src/workers/codeEvaluation.worker.ts
import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis';
import { evaluateCodeUsingJudge0 } from '../services/judge0.service'; // We'll create this too!

const codeEvaluationWorker = new Worker(
  'code-evaluation', // queue name (same as Queue)
  async (job) => {
    const { code, language, input, problemId, userId } = job.data;
    const evaluationResult = await evaluateCodeUsingJudge0({
      code,
      language,
      input,
    });

    return {
      evaluationResult,
      problemId,
      userId,
    };
  },
  { connection: redisConnection }
);

codeEvaluationWorker.on('completed', (job, returnvalue) => {
  console.log(`Job ${job.id} completed!`, returnvalue);
});

codeEvaluationWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed!`, err);
});

export default codeEvaluationWorker;
