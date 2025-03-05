import express from "express";
import { DEFAULT_PORT } from "./constants/app";
import { loggingMiddleware } from "./middlewares/logger";
import { errorHandlingMiddleware } from "./middlewares/error-handling.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { ConfigService } from "./services/config.service";
import { logEnvironmentVariables, logSuccess } from "./utils/logger.util";
import { databaseService } from "./services/database.service";
import { userRoutes } from './routes/user.routes';

// Initialize configuration
const configService = new ConfigService();

// Create Express app
const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Routes
app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Hello, TypeScript with Node.js deployed on AWS EC2, with CI/CD pipeline configured and working!" });
});

app.get("/error", (req: express.Request, res: express.Response) => {
  throw new Error("Test error");
});

// Database health check endpoint
app.get("/health/db", async (req: express.Request, res: express.Response) => {
  const isConnected = databaseService.isConnectedToMongoDB();
  console.log('I am in the health check endpoint');
  if (isConnected) {
    return res.status(200).json({ 
      status: 'ok',
      database: 'connected'
    });
  }
  
  return res.status(503).json({ 
    status: 'error',
    database: 'disconnected'
  });
});

app.use('/api/users', userRoutes);

// 404 handler - should be after all routes
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
      logSuccess(`Server running on http://localhost:${PORT}`, 'Server');
      logEnvironmentVariables(configService);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
