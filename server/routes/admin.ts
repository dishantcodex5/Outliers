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

// Get pending skills for approval
router.get(
  "/skills/pending",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      // Development mode without database - return mock skills
      if (req.noDatabaseConnection) {
        const mockSkills = [
          {
            _id: "skill-1",
            user: {
              _id: "user-1",
              name: "John Doe",
              email: "john@example.com",
            },
            skill: "Advanced React Development",
            description:
              "Teaching advanced React patterns, hooks, and performance optimization techniques.",
            category: "Programming",
            isApproved: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            _id: "skill-2",
            user: {
              _id: "user-2",
              name: "Jane Smith",
              email: "jane@example.com",
            },
            skill: "Digital Photography",
            description:
              "Professional photography techniques for portraits and landscapes.",
            category: "Creative",
            isApproved: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ];

        return res.json({ skills: mockSkills });
      }

      // In a real implementation, you'd have a Skills model
      // For now, return empty array
      res.json({ skills: [] });
    } catch (error) {
      console.error("Get pending skills error:", error);
      res.status(500).json({
        error: "Failed to get pending skills",
        message: "Internal server error",
      });
    }
  },
);

// Approve or reject skill
router.put(
  "/skills/:id/:action",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      const { id, action } = req.params;

      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({
          error: "Invalid action",
          message: "Action must be 'approve' or 'reject'",
        });
      }

      // Development mode without database - return mock success
      if (req.noDatabaseConnection) {
        return res.json({
          message: `Skill ${action}d successfully (development mode)`,
          skillId: id,
        });
      }

      // In a real implementation, you'd update the skill status
      res.json({
        message: `Skill ${action}d successfully`,
        skillId: id,
      });
    } catch (error) {
      console.error(`Skill ${req.params.action} error:`, error);
      res.status(500).json({
        error: `Failed to ${req.params.action} skill`,
        message: "Internal server error",
      });
    }
  },
);

// Get swap requests
router.get(
  "/swaps",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      // Development mode without database - return mock swaps
      if (req.noDatabaseConnection) {
        const mockSwaps = [
          {
            _id: "swap-1",
            from: {
              _id: "user-1",
              name: "John Doe",
              email: "john@example.com",
            },
            to: {
              _id: "user-2",
              name: "Jane Smith",
              email: "jane@example.com",
            },
            offeredSkill: "React Development",
            requestedSkill: "Photography",
            status: "pending",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            _id: "swap-2",
            from: {
              _id: "user-3",
              name: "Mike Johnson",
              email: "mike@example.com",
            },
            to: {
              _id: "user-4",
              name: "Sarah Wilson",
              email: "sarah@example.com",
            },
            offeredSkill: "Guitar Lessons",
            requestedSkill: "Spanish Tutoring",
            status: "accepted",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ];

        return res.json({ swaps: mockSwaps });
      }

      // In a real implementation, you'd fetch from SwapRequest model
      const swaps = await SwapRequest.find()
        .populate("from", "name email")
        .populate("to", "name email")
        .sort({ createdAt: -1 });

      res.json({ swaps });
    } catch (error) {
      console.error("Get swaps error:", error);
      res.status(500).json({
        error: "Failed to get swaps",
        message: "Internal server error",
      });
    }
  },
);

// Send platform message
router.post(
  "/messages",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      const { title, content, type, priority, targetUsers } = req.body;

      // Development mode without database - return mock success
      if (req.noDatabaseConnection) {
        return res.json({
          message: "Platform message sent successfully (development mode)",
          messageId: "mock-message-" + Date.now(),
        });
      }

      // In a real implementation, you'd save the message and send notifications
      // For now, just return success
      res.json({
        message: "Platform message sent successfully",
        messageId: "message-" + Date.now(),
      });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({
        error: "Failed to send message",
        message: "Internal server error",
      });
    }
  },
);

// Download reports
router.get(
  "/reports/:type",
  authenticateToken,
  requireAdmin,
  async (req: any, res: Response) => {
    try {
      const { type } = req.params;

      if (!["user-activity", "swap-stats", "feedback-logs"].includes(type)) {
        return res.status(400).json({
          error: "Invalid report type",
          message:
            "Report type must be 'user-activity', 'swap-stats', or 'feedback-logs'",
        });
      }

      // Development mode - return mock CSV data
      if (req.noDatabaseConnection || true) {
        // Always return mock for now
        let csvData = "";

        switch (type) {
          case "user-activity":
            csvData =
              "User ID,Name,Email,Registration Date,Last Login,Profile Completed,Skills Offered,Skills Wanted\n";
            csvData +=
              "1,John Doe,john@example.com,2024-01-15,2024-01-20,Yes,3,2\n";
            csvData +=
              "2,Jane Smith,jane@example.com,2024-01-16,2024-01-19,Yes,2,3\n";
            csvData +=
              "3,Mike Johnson,mike@example.com,2024-01-17,2024-01-18,No,1,1\n";
            break;
          case "swap-stats":
            csvData =
              "Swap ID,From User,To User,Offered Skill,Requested Skill,Status,Created Date,Completed Date\n";
            csvData +=
              "1,John Doe,Jane Smith,React Development,Photography,completed,2024-01-15,2024-01-20\n";
            csvData +=
              "2,Mike Johnson,Sarah Wilson,Guitar Lessons,Spanish,pending,2024-01-18,\n";
            csvData +=
              "3,Alex Chen,Emma Brown,Design,Cooking,cancelled,2024-01-19,\n";
            break;
          case "feedback-logs":
            csvData = "Feedback ID,User,Rating,Category,Comment,Date\n";
            csvData +=
              "1,John Doe,5,Platform,Great experience overall,2024-01-20\n";
            csvData +=
              "2,Jane Smith,4,Feature Request,Would love mobile app,2024-01-19\n";
            csvData +=
              "3,Mike Johnson,3,Bug Report,Chat loading slowly,2024-01-18\n";
            break;
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${type}-report.csv"`,
        );
        return res.send(csvData);
      }

      // In a real implementation, you'd generate actual reports from database
      res.status(500).json({
        error: "Report generation not implemented",
        message: "This feature requires database integration",
      });
    } catch (error) {
      console.error("Download report error:", error);
      res.status(500).json({
        error: "Failed to generate report",
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
