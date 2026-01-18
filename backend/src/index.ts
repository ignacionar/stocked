import express from "express";
import cors from "cors";
import stockRoutes from "@/routes/stock.routes";
import commerceRoutes from "@/routes/commerce.routes";
import userRoutes from "@/routes/user.routes";
import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// app.use(express.json({ limit: "20mb" }));
// app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, status: 200, timestamp: new Date().toISOString() });
});

// Auth routes
app.all("/api/auth/*", toNodeHandler(auth));

const jsonRouter = express.Router();
jsonRouter.use(express.json({ limit: "20mb" }));
jsonRouter.use(express.urlencoded({ extended: true, limit: "20mb" }));

jsonRouter.use("/stock", stockRoutes);
jsonRouter.use("/commerces", commerceRoutes);
jsonRouter.use("/users", userRoutes);

app.use("/api", jsonRouter);

// Upload router (sin json)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal en el servidor" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
