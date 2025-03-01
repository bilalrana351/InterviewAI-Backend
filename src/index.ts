import express from "express";
import { DEFAULT_PORT } from "./constants/app";
import { loggingMiddleware, errorHandlingMiddleware, notFoundMiddleware } from "./middlewares/logger";
import { ConfigService } from "./services/config.service";
import { logEnvironmentVariables, logSuccess } from "./utils/logger.util";


const configService = new ConfigService();

const app = express();

const PORT = process.env.PORT || DEFAULT_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

app.get("/", (req: express.Request, res: express.Response) => {
  res.status(500).json({ message: "Hello, TypeScript with Node.js!" });
});

app.use(notFoundMiddleware);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  logSuccess(`Server running on http://localhost:${PORT}`, 'Server');
  logEnvironmentVariables(configService.getAll());
});
