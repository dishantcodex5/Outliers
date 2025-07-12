import { Router, Response } from "express";
import { SwapRequest } from "../models/SwapRequest";
import { User } from "../models/User";
import { Conversation } from "../models/Conversation";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// Get user's swap requests
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { status, type = "all" } = req.query;

      let query: any = {};

      // Filter by type (incoming, outgoing, or all)
      if (type === "incoming") {
        query.to = userId;
      } else if (type === "outgoing") {
        query.from = userId;
      } else {
        query.$or = [{ from: userId }, { to: userId }];
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      const requests = await SwapRequest.find(query)
        .populate("from", "name email profilePhoto")
        .populate("to", "name email profilePhoto")
        .sort({ createdAt: -1 });

      // Separate incoming and outgoing requests
      const incoming = requests.filter(
        (req) => req.to._id.toString() === userId,
      );
      const outgoing = requests.filter(
        (req) => req.from._id.toString() === userId,
      );

      res.json({
        requests: {
          incoming,
          outgoing,
          all: requests,
        },
      });
    } catch (error) {
      console.error("Get requests error:", error);
      res.status(500).json({
        error: "Failed to get requests",
        message: "Internal server error",
      });
    }
  },
);

// Create new swap request
router.post(
  "/",
  authenticateToken,
  validateRequest([
    {
      field: "to",
      required: true,
      type: "string",
    },
    {
      field: "skillOffered",
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    {
      field: "skillWanted",
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    {
      field: "message",
      required: true,
      type: "string",
      minLength: 10,
      maxLength: 1000,
    },
    {
      field: "duration",
      type: "string",
      maxLength: 50,
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        to,
        skillOffered,
        skillWanted,
        message,
        duration = "1 hour",
      } = req.body;
      const fromUserId = req.user!.id;

      // Check if trying to send request to self
      if (fromUserId === to) {
        return res.status(400).json({
          error: "Invalid request",
          message: "You cannot send a request to yourself",
        });
      }

      // Check if target user exists
      const targetUser = await User.findById(to);
      if (!targetUser) {
        return res.status(404).json({
          error: "User not found",
          message: "Target user does not exist",
        });
      }

      // Check if target user has the requested skill
      const hasSkill = targetUser.skillsOffered.some(
        (skill) => skill.skill.toLowerCase() === skillWanted.toLowerCase(),
      );
      if (!hasSkill) {
        return res.status(400).json({
          error: "Skill not available",
          message: "Target user does not offer this skill",
        });
      }

      // Check if sender has the offered skill
      const senderUser = await User.findById(fromUserId);
      const canOffer = senderUser?.skillsOffered.some(
        (skill) => skill.skill.toLowerCase() === skillOffered.toLowerCase(),
      );
      if (!canOffer) {
        return res.status(400).json({
          error: "Skill not available",
          message: "You do not have this skill to offer",
        });
      }

      // Check for existing pending request
      const existingRequest = await SwapRequest.findOne({
        from: fromUserId,
        to,
        skillOffered,
        skillWanted,
        status: "pending",
      });

      if (existingRequest) {
        return res.status(400).json({
          error: "Request already exists",
          message: "You already have a pending request for this skill exchange",
        });
      }

      // Create new request
      const swapRequest = new SwapRequest({
        from: fromUserId,
        to,
        skillOffered,
        skillWanted,
        message,
        duration,
      });

      await swapRequest.save();

      // Populate the created request
      await swapRequest.populate("from", "name email profilePhoto");
      await swapRequest.populate("to", "name email profilePhoto");

      res.status(201).json({
        message: "Swap request created successfully",
        request: swapRequest,
      });
    } catch (error) {
      console.error("Create request error:", error);
      res.status(500).json({
        error: "Failed to create request",
        message: "Internal server error",
      });
    }
  },
);

// Accept swap request
router.put(
  "/:id/accept",
  authenticateToken,
  validateRequest([
    {
      field: "welcomeMessage",
      type: "string",
      maxLength: 500,
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { welcomeMessage = "" } = req.body;
      const userId = req.user!.id;

      const request = await SwapRequest.findById(id)
        .populate("from", "name email profilePhoto")
        .populate("to", "name email profilePhoto");

      if (!request) {
        return res.status(404).json({
          error: "Request not found",
          message: "Swap request does not exist",
        });
      }

      // Only the recipient can accept
      if (request.to._id.toString() !== userId) {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only accept requests sent to you",
        });
      }

      // Check if already processed
      if (request.status !== "pending") {
        return res.status(400).json({
          error: "Request already processed",
          message: `Request has already been ${request.status}`,
        });
      }

      // Update request status
      request.status = "accepted";
      await request.save();

      // Create or find conversation between users
      let conversation = await Conversation.findOne({
        participants: { $all: [request.from._id, request.to._id] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [request.from._id, request.to._id],
          swapRequest: request._id,
          messages: [],
        });
      }

      // Add system message about acceptance
      const systemMessage = {
        sender: request.to._id,
        content: `Skill exchange request accepted! ${
          welcomeMessage ? `\n\n${welcomeMessage}` : ""
        }`,
        type: "system" as const,
        status: "sent" as const,
      };

      conversation.messages.push(systemMessage);
      conversation.lastMessage = {
        content: systemMessage.content,
        sender: request.to._id,
        timestamp: new Date(),
      };

      await conversation.save();

      res.json({
        message: "Request accepted successfully",
        request,
        conversationId: conversation._id,
      });
    } catch (error) {
      console.error("Accept request error:", error);
      res.status(500).json({
        error: "Failed to accept request",
        message: "Internal server error",
      });
    }
  },
);

// Reject swap request
router.put(
  "/:id/reject",
  authenticateToken,
  validateRequest([
    {
      field: "reason",
      type: "string",
      maxLength: 500,
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { reason = "" } = req.body;
      const userId = req.user!.id;

      const request = await SwapRequest.findById(id)
        .populate("from", "name email profilePhoto")
        .populate("to", "name email profilePhoto");

      if (!request) {
        return res.status(404).json({
          error: "Request not found",
          message: "Swap request does not exist",
        });
      }

      // Only the recipient can reject
      if (request.to._id.toString() !== userId) {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only reject requests sent to you",
        });
      }

      // Check if already processed
      if (request.status !== "pending") {
        return res.status(400).json({
          error: "Request already processed",
          message: `Request has already been ${request.status}`,
        });
      }

      // Update request status
      request.status = "rejected";
      await request.save();

      res.json({
        message: "Request rejected successfully",
        request,
      });
    } catch (error) {
      console.error("Reject request error:", error);
      res.status(500).json({
        error: "Failed to reject request",
        message: "Internal server error",
      });
    }
  },
);

// Get specific request details
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const request = await SwapRequest.findById(id)
        .populate("from", "name email profilePhoto")
        .populate("to", "name email profilePhoto");

      if (!request) {
        return res.status(404).json({
          error: "Request not found",
          message: "Swap request does not exist",
        });
      }

      // Only participants can view the request
      if (
        request.from._id.toString() !== userId &&
        request.to._id.toString() !== userId
      ) {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only view your own requests",
        });
      }

      res.json({
        request,
      });
    } catch (error) {
      console.error("Get request error:", error);
      res.status(500).json({
        error: "Failed to get request",
        message: "Internal server error",
      });
    }
  },
);

// Cancel swap request (by sender)
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const request = await SwapRequest.findById(id);

      if (!request) {
        return res.status(404).json({
          error: "Request not found",
          message: "Swap request does not exist",
        });
      }

      // Only the sender can cancel
      if (request.from.toString() !== userId) {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only cancel requests you sent",
        });
      }

      // Can only cancel pending requests
      if (request.status !== "pending") {
        return res.status(400).json({
          error: "Cannot cancel request",
          message: "Only pending requests can be cancelled",
        });
      }

      await SwapRequest.findByIdAndDelete(id);

      res.json({
        message: "Request cancelled successfully",
      });
    } catch (error) {
      console.error("Cancel request error:", error);
      res.status(500).json({
        error: "Failed to cancel request",
        message: "Internal server error",
      });
    }
  },
);

export { router as requestRoutes };
