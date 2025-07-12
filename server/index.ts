import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { requestRoutes } from "./routes/requests";
import { conversationRoutes } from "./routes/conversations";
import { skillRoutes } from "./routes/skills";
import { handleDemo } from "./routes/demo";
import { checkDatabaseConnection } from "./middleware/database";

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
  app.get("/api/health", checkDatabaseConnection);

  // API Routes with database check
  app.use("/api/auth", checkDatabaseConnection, authRoutes);
  app.use("/api/users", checkDatabaseConnection, userRoutes);
  app.use("/api/requests", checkDatabaseConnection, requestRoutes);
  app.use("/api/conversations", checkDatabaseConnection, conversationRoutes);
  app.use("/api/skills", checkDatabaseConnection, skillRoutes);

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

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const path = require("path");
    app.use(express.static(path.join(__dirname, "../spa")));

    // SPA fallback for client-side routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../spa/index.html"));
    });
  } else {
    // In development, only handle non-API routes with 404 for API calls
    app.use("/api/*", (req, res) => {
      res.status(404).json({
        error: "Not found",
        message: `API route ${req.originalUrl} not found`,
      });
    });
  }

  return app;
}
