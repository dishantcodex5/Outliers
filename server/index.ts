import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { requestRoutes } from "./routes/requests";
import { conversationRoutes } from "./routes/conversations";
import { skillRoutes } from "./routes/skills";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Connect to database
  connectDatabase().catch((error) => {
    console.error("Failed to connect to database:", error);
    // Continue running server even if database connection fails in development
  });

  // Middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:8080",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      message: "SkillSwap API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/requests", requestRoutes);
  app.use("/api/conversations", conversationRoutes);
  app.use("/api/skills", skillRoutes);

  // Legacy routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app.get("/api/demo", handleDemo);

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Server error:", err);
      res.status(500).json({
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    },
  );

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Not found",
      message: `Route ${req.originalUrl} not found`,
    });
  });

  return app;
}
