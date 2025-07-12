import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import {
  validateRequest,
  emailValidation,
  passwordValidation,
  nameValidation,
} from "../middleware/validation";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Register
router.post(
  "/signup",
  validateRequest([nameValidation, emailValidation, passwordValidation]),
  async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Development mode without database - return mock success
      if ((req as any).noDatabaseConnection) {
        const mockUser = {
          _id: "dev-user-" + Date.now(),
          name,
          email: email.toLowerCase(),
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          profileCompleted: false,
          isDevelopmentUser: true,
        };

        const token = generateToken({
          userId: mockUser._id,
          email: mockUser.email,
        });

        return res.status(201).json({
          message: "User registered successfully (development mode)",
          token,
          user: mockUser,
          warning: "Running without database - data will not persist",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          error: "Registration failed",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate profile photo URL
      const profilePhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        name,
      )}`;

      // Create user
      const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        profilePhoto,
        profileCompleted: false,
      });

      await user.save();

      // Generate token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        error: "Registration failed",
        message: "Internal server error",
      });
    }
  },
);

// Login
router.post(
  "/login",
  validateRequest([emailValidation, passwordValidation]),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Development mode without database - return mock success for any credentials
      if ((req as any).noDatabaseConnection) {
        const mockUser = {
          _id: "dev-user-" + Date.now(),
          name: "Development User",
          email: email.toLowerCase(),
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          profileCompleted: false,
          isDevelopmentUser: true,
        };

        const token = generateToken({
          userId: mockUser._id,
          email: mockUser.email,
        });

        return res.json({
          message: "Login successful (development mode)",
          token,
          user: mockUser,
          warning: "Running without database - using mock authentication",
        });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid email or password",
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.json({
        message: "Login successful",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Authentication failed",
        message: "Internal server error",
      });
    }
  },
);

// Get current user
router.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      res.json({
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        error: "Failed to get user",
        message: "Internal server error",
      });
    }
  },
);

// Logout (client-side token removal)
router.post("/logout", (req: Request, res: Response) => {
  res.json({
    message: "Logout successful",
  });
});

// Refresh token
router.post(
  "/refresh",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      // Generate new token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.json({
        message: "Token refreshed successfully",
        token,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({
        error: "Token refresh failed",
        message: "Internal server error",
      });
    }
  },
);

export { router as authRoutes };
