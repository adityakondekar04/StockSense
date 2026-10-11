import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    db: false,
    llmConfigured: Boolean(process.env.LLM_API_KEY)
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`StockSense API listening on http://localhost:${port}`);
  });
}

export default app;
