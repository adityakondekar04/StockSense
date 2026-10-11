import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error) {
    dbOk = false;
  }

  res.json({
    ok: true,
    db: dbOk,
    llmConfigured: Boolean(process.env.LLM_API_KEY)
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`StockSense API listening on http://localhost:${port}`);
  });
}

export default app;
