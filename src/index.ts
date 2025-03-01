import express from "express";
import { DEFAULT_PORT } from "./constants/app";
import { loggingMiddleware } from "./middlewares/logger";
import { errorHandlingMiddleware } from "./middlewares/error-handling.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { ConfigService } from "./services/config.service";
import { logEnvironmentVariables, logSuccess } from "./utils/logger.util";


const configService = new ConfigService();

const app = express();

const PORT = process.env.PORT || DEFAULT_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Hello, TypeScript with Node.js!" });
});

app.get("/error", (req: express.Request, res: express.Response) => {
  throw new Error("Test error");
});

app.use(notFoundMiddleware);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  logSuccess(`Server running on http://localhost:${PORT}`, 'Server');
  logEnvironmentVariables(configService.getAll());
});
