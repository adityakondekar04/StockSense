import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db.js";
import { importRouter } from "./import/routes.js";
import { productsRouter } from "./products/routes.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.text({ type: ["text/csv", "text/plain"] }));

// Health check
app.get(["/api/health", "/health"], async (_req, res) => {
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

// Import endpoints
app.use("/api/import", importRouter);
app.use("/import", importRouter);

// Products CRUD endpoints
app.use("/api/products", productsRouter);
app.use("/products", productsRouter);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`StockSense API listening on http://localhost:${port}`);
  });
}

export default app;

