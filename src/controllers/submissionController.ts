import codeQueue from "../lib/queue";
import {Response} from "express"
import { AuthenticatedRequest } from "../types/Requests";
export const submitCode = async (req: AuthenticatedRequest, res:Response) => {
  const { code, language, input, problemId } = req.body;

  const job = await codeQueue.add('evaluate', {
    code,
    language,
    input,
    problemId,
    userId: req.user.id,
  });

  return res.json({
    submissionId: job.id, // Give frontend something to track
    message: 'Code submitted successfully!',
  });
};
