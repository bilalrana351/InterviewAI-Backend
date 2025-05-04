import codeQueue from "../lib/queue";
import { Response } from "express";
import { AuthenticatedRequest } from "../types/Requests";
import Submission from "../models/Submission";
import { databaseService } from "../services/database.service";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URI!, {});

export const submitCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, language, input, output, userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId is required in the request body" });
    }

    // Create a submission record
    const submission = await Submission.create({
      code,
      language,
      input,
      output,
      status: "pending",
      userId,
    });

    // Add to queue for evaluation
    await codeQueue.add("evaluate", {
      submissionId: submission._id,
      code,
      language,
      input,
      output,
      userId,
    });

    return res.json({
      submissionId: submission._id,
      message: "Code submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting code:", error);
    return res.status(500).json({ error: "Failed to submit code" });
  }
};

export const getSubmission = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { submissionId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "userId is required in the request body" });
    }
    // Find submission and ensure it belongs to the requesting user
    const submission = await Submission.findOne({
      _id: submissionId,
      userId,
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    return res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return res.status(500).json({ error: "Failed to fetch submission" });
  }
};
