import { Router } from "express";
import { submitCode, getSubmission } from "../controllers/submissionController";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Submit code for evaluation
router.post("/", submitCode);

// Get submission result
router.get("/:submissionId", getSubmission);

export const submissionRoutes = router;
