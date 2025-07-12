import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export function checkDatabaseConnection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // If database is not connected, handle based on environment
  if (mongoose.connection.readyState !== 1) {
    // Health check endpoint should always work
    if (req.path === "/api/health") {
      return res.json({
        status: "ok",
        message: "SkillSwap API is running (no database)",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      });
    }

    // In development, warn but continue (allows testing without MongoDB)
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️  API call to ${req.path} without MongoDB connection`);
      // Add a flag to indicate no database connection
      (req as any).noDatabaseConnection = true;
      return next();
    }

    // In production, require database connection
    return res.status(503).json({
      error: "Database not available",
      message: "MongoDB is not connected. Service unavailable.",
      suggestion: "Database connection required in production",
    });
  }

  next();
}
