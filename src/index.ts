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
const configService = new ConfigService();
const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json());
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
app.use(requireAuth)
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/submissions", submissionRoutes);
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
