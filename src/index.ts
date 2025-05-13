import express from "express";
import { DEFAULT_PORT } from "./constants/app";
import { loggingMiddleware } from "./middlewares/logger";
import { errorHandlingMiddleware } from "./middlewares/error-handling.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { ConfigService } from "./services/config.service";
import { logEnvironmentVariables, logSuccess } from "./utils/logger.util";
import { databaseService } from "./services/database.service";
import { auth } from "./lib/auth";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { userRoutes } from "./routes/User";
import { companyRoutes } from "./routes/Company";
import { employeeRoutes } from "./routes/Employee";
import { interviewRoutes } from "./routes/Interview";
import { jobRoutes } from "./routes/Job";
import { submissionRoutes } from "./routes/Submission";
import {
  requireAuth,
  AuthenticatedRequest,
} from "./middlewares/auth.middleware";
import { systemDesignRoutes } from "./routes/SystemDesign";
import { cvRoutes } from "./routes/CvUploadAndParse";
import { Interview } from "./models/Interview";

const configService = new ConfigService();
const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;
app.use(
  cors({
    origin: ["https://interview-ai-client-nine.vercel.app","http://localhost:5173","*"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(loggingMiddleware);

app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json({ limit: '50mb' }));

app.get("/", (req: express.Request, res: express.Response) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  // Check for cookies
  const cookies = req.headers.cookie;
  console.log("Cookies:", cookies);

  // Parse cookies into an object
  const parsedCookies: Record<string, string> = {};
  if (cookies) {
    cookies.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const name = parts[0].trim();
      const value = parts.slice(1).join("=").trim();
      parsedCookies[name] = value;
    });
  }

  // Look for session cookie (adjust the name based on your actual session cookie name)
  const sessionCookie =
    parsedCookies["next-auth.session-token"] ||
    parsedCookies["__session"] ||
    parsedCookies["session"];

  console.log("Session cookie:", sessionCookie);

  // Check for any token in query params
  const queryToken = req.query.token;
  console.log("Query token:", queryToken);

  res.status(200).json({
    message:
      "Hello, TypeScript with Node.js deployed on AWS EC2, with CI/CD pipeline configured, tested and working!",
    session: sessionCookie ? "Session found" : "No session found",
  });
});

// A protected route example that requires authentication
app.get("/api/protected", (req: express.Request, res: express.Response) => {
  // TypeScript doesn't know about our custom properties, so we need to cast
  const authenticatedReq = req as AuthenticatedRequest;

  res.status(200).json({
    message: "This is a protected route - you are authenticated!",
    user: {
      id: authenticatedReq.user?.id,
      email: authenticatedReq.user?.email,
      name: authenticatedReq.user?.name,
      emailVerified: authenticatedReq.user?.emailVerified,
    },
  });
});

// This will be a route to check if the AI service is running
app.get("/ai/status", async (req: express.Request, res: express.Response) => {
  const response = await fetch(`${process.env.AI_SERVICE_URL}`);
  const data = await response.json();
  res.status(200).json(data);
});

app.get("/error", (req: express.Request, res: express.Response) => {
  throw new Error("Test error");
});

// Database health check endpoint
app.get("/health/db", async (req: express.Request, res: express.Response) => {
  const isConnected = databaseService.isConnectedToMongoDB();
  console.log("I am in the health check endpoint");
  if (isConnected) {
    return res.status(200).json({
      status: "ok",
      database: "connected",
    });
  }

  return res.status(503).json({
    status: "error",
    database: "disconnected",
  });
});

// Associate Vapi call ID with knowledge-based interview round
app.post('/api/interviews/:id/associate-call', async (req, res) => {
  console.log("I am in the associate call endpoint");
  try {
    const { id } = req.params;
    const { callId, roundIndex } = req.body;
    
    if (!id || !callId || roundIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: interviewId, callId, or roundIndex'
      });
    }

    // Find the interview and update the specified round with the call ID
    const interview = await Interview.findById(id);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Check if the round exists and is a knowledge-based round
    if (!interview.rounds[roundIndex] || interview.rounds[roundIndex].type !== 'KnowledgeBased') {
      return res.status(400).json({
        success: false,
        error: 'Invalid round index or round is not a knowledge-based interview'
      });
    }

    // Update the round with the call ID
    interview.rounds[roundIndex].callId = callId;
    interview.rounds[roundIndex].status = 'in-progress';
    
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Call ID associated with knowledge-based interview round',
      data: interview.rounds[roundIndex]
    });
  } catch (error) {
    console.error('Error associating call ID with interview:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to associate call ID with interview'
    });
  }
});

// End of call report endpoint
app.post('/api/end-of-call-report', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Log the raw incoming message for debugging
    // console.log('Received payload:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!message || message.type !== 'end-of-call-report') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format'
      });
    }

    console.log('End of Call Report Received:');
    console.log("Call ID:", message.call?.id);
    console.log("\n\n");
    console.log("Transcript:\n");
    console.log(message.transcript);

    // If there's a call ID, try to find the associated interview round and update it
    if (message.call?.id) {
      const callId = message.call.id;
      
      // Find interview with a round that has this call ID
      const interview = await Interview.findOne({
        "rounds.callId": callId
      });
      console.log("we found the Interview associated with the call ID:", interview);

      if (interview) {
        // Find the index of the round with this call ID
        const roundIndex = interview.rounds.findIndex(round => round.callId === callId);
        
        if (roundIndex !== -1) {
          // Update the round with the transcript and mark as completed
          interview.rounds[roundIndex].transcript = message.transcript;
          interview.rounds[roundIndex].status = 'completed';
          
          // If there's a summary, add it to remarks
          if (message.summary) {
            interview.rounds[roundIndex].remarks = message.summary;
          }
          
          await interview.save();
          
          console.log(`Successfully updated interview ${interview._id} with transcript for round ${roundIndex}`);
        }
      } else {
        console.log(`No interview found with call ID: ${callId}`);
      }
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'End of call report received successfully'
    });
  } catch (error) {
    // Error handling
    console.error('Error processing end of call report:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

app.use(requireAuth);

app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/system-design", systemDesignRoutes);
app.use("/api/cv", cvRoutes);
app.use(notFoundMiddleware);

// Error handling middleware - should be last
app.use(errorHandlingMiddleware);

// Start server and connect to database
async function startServer() {
  try {
    // Connect to MongoDB
    await databaseService.connect();

    // Start Express server
    app.listen(PORT, () => {
      logSuccess(`Server running on http://localhost:${PORT}`, "Server");
      logEnvironmentVariables(configService);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
