import { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt";
import { User } from "../models/User";

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        message: "No token provided",
      });
    }

    const payload = verifyToken(token);

    // Handle special admin user case
    if (payload.userId === "admin-user-fixed") {
      req.user = {
        id: "admin-user-fixed",
        email: "admin@skillswap.com",
        role: "admin",
      };
      return next();
    }

    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid token",
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Authentication failed",
      message: "Invalid or expired token",
    });
  }
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "No user found in request",
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: "Access denied",
        message: `${role} role required`,
      });
    }

    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: "user", // Default role for optional auth
    };
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
}
