import express from "express";
import { DEFAULT_PORT } from "./constants/app";
import dotenv from 'dotenv'

dotenv.config();

const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello, TypeScript with Node.js!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
