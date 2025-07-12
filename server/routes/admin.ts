import { Router, Response } from "express";
import { User } from "../models/User";
import { SwapRequest } from "../models/SwapRequest";
import { Conversation } from "../models/Conversation";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Middleware to check if user is admin
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: "Access denied",
      message: "Admin privileges required",
    });
  }
  next();
};

// Get admin dashboard stats
router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      // Development mode without database - return mock stats
      if (req.noDatabaseConnection) {
        return res.json({
          users: {
            total: 125,
            active: 89,
            newThisMonth: 12,
          },
          requests: {
            total: 45,
            pending: 8,
            accepted: 32,
            successRate: 71.1,
          },
          conversations: {
            total: 67,
          },
        });
      }

      // Get user stats
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ profileCompleted: true });
      const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });

      // Get request stats
      const totalRequests = await SwapRequest.countDocuments();
      const pendingRequests = await SwapRequest.countDocuments({
        status: "pending",
      });
      const acceptedRequests = await SwapRequest.countDocuments({
        status: "accepted",
      });

      // Get conversation stats
      const totalConversations = await Conversation.countDocuments();

      // Calculate success rate
      const successRate =
        totalRequests > 0 ? (acceptedRequests / totalRequests) * 100 : 0;

      res.json({
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          accepted: acceptedRequests,
          successRate: Math.round(successRate * 10) / 10,
        },
        conversations: {
          total: totalConversations,
        },
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({
        error: "Failed to get admin stats",
        message: "Internal server error",
      });
    }
  },
);

// Get all users with pagination
router.get(
  "/users",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      const { page = 1, limit = 20, search = "" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      // Development mode without database - return mock users
      if (req.noDatabaseConnection) {
        const mockUsers = [
          {
            _id: "mock-user-1",
            name: "John Doe",
            email: "john@example.com",
            role: "user",
            profileCompleted: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            _id: "mock-user-2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "user",
            profileCompleted: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            _id: "mock-user-3",
            name: "Mike Johnson",
            email: "mike@example.com",
            role: "user",
            profileCompleted: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
        ];

        return res.json({
          users: mockUsers,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: mockUsers.length,
            pages: Math.ceil(mockUsers.length / limitNum),
          },
        });
      }

      const skip = (pageNum - 1) * limitNum;

      let query: any = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        };
      }

      const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        error: "Failed to get users",
        message: "Internal server error",
      });
    }
  },
);

// Update user status (ban/unban)
router.put(
  "/users/:id/status",
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'active' or 'banned'

      if (!["active", "banned"].includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          message: "Status must be 'active' or 'banned'",
        });
      }

      // Development mode without database - return mock success
      if ((req as any).noDatabaseConnection) {
        return res.json({
          message: `User ${status === "banned" ? "banned" : "unbanned"} successfully (development mode)`,
          user: {
            _id: id,
            name: "Mock User",
            email: "mock@example.com",
            status: status,
          },
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      // Prevent admins from banning themselves
      if (user._id.toString() === req.user!.id) {
        return res.status(400).json({
          error: "Invalid action",
          message: "You cannot change your own status",
        });
      }

      // Add a status field to user schema for future use
      await User.findByIdAndUpdate(id, {
        $set: { status: status },
      });

      res.json({
        message: `User ${status === "banned" ? "banned" : "unbanned"} successfully`,
        user: { ...user.toJSON(), status },
      });
    } catch (error) {
      console.error("Update user status error:", error);
      res.status(500).json({
        error: "Failed to update user status",
        message: "Internal server error",
      });
    }
  },
);

// Get recent activity
router.get(
  "/activity",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      const { limit = 10 } = req.query;
      const limitNum = parseInt(limit as string);

      // Development mode without database - return mock activity
      if (req.noDatabaseConnection) {
        const mockActivity = [
          {
            type: "user_joined",
            description: "John Doe joined the platform",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            user: "John Doe",
          },
          {
            type: "request_created",
            description:
              "Jane Smith sent a skill exchange request to Mike Johnson",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            status: "pending",
          },
          {
            type: "user_joined",
            description: "Sarah Wilson joined the platform",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            user: "Sarah Wilson",
          },
          {
            type: "request_created",
            description:
              "Alex Chen sent a skill exchange request to Emma Brown",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            status: "accepted",
          },
        ];

        return res.json({ activity: mockActivity.slice(0, limitNum) });
      }

      // Get recent users
      const recentUsers = await User.find()
        .select("name email createdAt")
        .sort({ createdAt: -1 })
        .limit(5);

      // Get recent requests
      const recentRequests = await SwapRequest.find()
        .populate("from", "name email")
        .populate("to", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

      // Format activity feed
      const activity = [
        ...recentUsers.map((user) => ({
          type: "user_joined",
          description: `${user.name} joined the platform`,
          timestamp: user.createdAt,
          user: user.name,
        })),
        ...recentRequests.map((request: any) => ({
          type: "request_created",
          description: `${request.from.name} sent a skill exchange request to ${request.to.name}`,
          timestamp: request.createdAt,
          status: request.status,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, limitNum);

      res.json({ activity });
    } catch (error) {
      console.error("Get admin activity error:", error);
      res.status(500).json({
        error: "Failed to get admin activity",
        message: "Internal server error",
      });
    }
  },
);

// Get flagged content (placeholder - would need a reporting system)
router.get(
  "/flagged",
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // For now, return empty array since we don't have a reporting system
      // In a real app, you'd have a Reports model
      res.json({
        flaggedContent: [],
        message: "No flagged content at this time",
      });
    } catch (error) {
      console.error("Get flagged content error:", error);
      res.status(500).json({
        error: "Failed to get flagged content",
        message: "Internal server error",
      });
    }
  },
);

export { router as adminRoutes };
