import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export function checkDatabaseConnection(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // If database is not connected, return mock responses for development
  if (mongoose.connection.readyState !== 1) {
    // Health check endpoint should still work
    if (req.path === "/api/health") {
      return res.json({
        status: "ok",
        message: "SkillSwap API is running (no database)",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      });
    }

    // For other API endpoints, return a development message
    return res.status(503).json({
      error: "Database not available",
      message: "MongoDB is not connected. Running in development mode.",
      suggestion: "Install and start MongoDB to use full functionality",
    });
  }

  next();
}
