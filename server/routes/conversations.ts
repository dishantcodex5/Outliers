import { Router, Response } from "express";
import { Conversation } from "../models/Conversation";
import { User } from "../models/User";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// Get user's conversations
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const conversations = await Conversation.find({
        participants: userId,
      })
        .populate("participants", "name email profilePhoto")
        .populate("swapRequest")
        .sort({ updatedAt: -1 });

      // Format conversations for frontend
      const formattedConversations = conversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id.toString() !== userId,
        );

        return {
          id: conv._id,
          otherUser: otherParticipant,
          lastMessage: conv.lastMessage,
          swapRequest: conv.swapRequest,
          messageCount: conv.messages.length,
          unreadCount: conv.messages.filter(
            (msg) => msg.sender.toString() !== userId && msg.status !== "read",
          ).length,
          updatedAt: conv.updatedAt,
        };
      });

      res.json({
        conversations: formattedConversations,
      });
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({
        error: "Failed to get conversations",
        message: "Internal server error",
      });
    }
  },
);

// Get specific conversation with messages
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { page = 1, limit = 50 } = req.query;

      const conversation = await Conversation.findById(id)
        .populate("participants", "name email profilePhoto")
        .populate("swapRequest");

      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found",
          message: "Conversation does not exist",
        });
      }

      // Check if user is participant
      const isParticipant = conversation.participants.some(
        (p: any) => p._id.toString() === userId,
      );

      if (!isParticipant) {
        return res.status(403).json({
          error: "Access denied",
          message: "You are not a participant in this conversation",
        });
      }

      // Pagination for messages
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const totalMessages = conversation.messages.length;
      const startIndex = Math.max(0, totalMessages - pageNum * limitNum);
      const endIndex = totalMessages - (pageNum - 1) * limitNum;

      const messages = conversation.messages
        .slice(startIndex, endIndex)
        .map((msg) => ({
          id: msg._id,
          senderId: msg.sender,
          content: msg.content,
          type: msg.type,
          status: msg.status,
          timestamp: msg.createdAt,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
        }));

      // Mark messages as read
      const unreadMessages = conversation.messages.filter(
        (msg) => msg.sender.toString() !== userId && msg.status !== "read",
      );

      if (unreadMessages.length > 0) {
        unreadMessages.forEach((msg) => {
          msg.status = "read";
        });
        await conversation.save();
      }

      const otherParticipant = conversation.participants.find(
        (p: any) => p._id.toString() !== userId,
      );

      res.json({
        conversation: {
          id: conversation._id,
          participants: conversation.participants,
          otherUser: otherParticipant,
          swapRequest: conversation.swapRequest,
          messages,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalMessages,
            hasMore: startIndex > 0,
          },
        },
      });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({
        error: "Failed to get conversation",
        message: "Internal server error",
      });
    }
  },
);

// Send message in conversation
router.post(
  "/:id/messages",
  authenticateToken,
  validateRequest([
    {
      field: "content",
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 2000,
    },
    {
      field: "type",
      type: "string",
      custom: (value) =>
        !value || ["text", "file"].includes(value)
          ? true
          : "Type must be text or file",
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { content, type = "text", fileUrl, fileName } = req.body;
      const userId = req.user!.id;

      const conversation = await Conversation.findById(id).populate(
        "participants",
        "name email profilePhoto",
      );

      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found",
          message: "Conversation does not exist",
        });
      }

      // Check if user is participant
      const isParticipant = conversation.participants.some(
        (p: any) => p._id.toString() === userId,
      );

      if (!isParticipant) {
        return res.status(403).json({
          error: "Access denied",
          message: "You are not a participant in this conversation",
        });
      }

      // Create new message
      const newMessage = {
        sender: userId,
        content,
        type,
        status: "sent" as const,
        ...(type === "file" && { fileUrl, fileName }),
      };

      conversation.messages.push(newMessage);

      // Update last message
      conversation.lastMessage = {
        content,
        sender: userId,
        timestamp: new Date(),
      };

      await conversation.save();

      // Get the created message
      const createdMessage =
        conversation.messages[conversation.messages.length - 1];

      res.status(201).json({
        message: "Message sent successfully",
        messageData: {
          id: createdMessage._id,
          senderId: createdMessage.sender,
          content: createdMessage.content,
          type: createdMessage.type,
          status: createdMessage.status,
          timestamp: createdMessage.createdAt,
          fileUrl: createdMessage.fileUrl,
          fileName: createdMessage.fileName,
        },
      });

      // TODO: Implement real-time notifications with Socket.IO
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({
        error: "Failed to send message",
        message: "Internal server error",
      });
    }
  },
);

// Create new conversation
router.post(
  "/",
  authenticateToken,
  validateRequest([
    {
      field: "participantId",
      required: true,
      type: "string",
    },
    {
      field: "initialMessage",
      type: "string",
      minLength: 1,
      maxLength: 2000,
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId, initialMessage } = req.body;
      const userId = req.user!.id;

      // Check if trying to create conversation with self
      if (userId === participantId) {
        return res.status(400).json({
          error: "Invalid request",
          message: "You cannot create a conversation with yourself",
        });
      }

      // Check if other user exists
      const otherUser = await User.findById(participantId);
      if (!otherUser) {
        return res.status(404).json({
          error: "User not found",
          message: "Other participant does not exist",
        });
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, participantId] },
      });

      if (conversation) {
        return res.status(200).json({
          message: "Conversation already exists",
          conversationId: conversation._id,
        });
      }

      // Create new conversation
      conversation = new Conversation({
        participants: [userId, participantId],
        messages: [],
      });

      // Add initial message if provided
      if (initialMessage) {
        const message = {
          sender: userId,
          content: initialMessage,
          type: "text" as const,
          status: "sent" as const,
        };

        conversation.messages.push(message);
        conversation.lastMessage = {
          content: initialMessage,
          sender: userId,
          timestamp: new Date(),
        };
      }

      await conversation.save();

      res.status(201).json({
        message: "Conversation created successfully",
        conversationId: conversation._id,
      });
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({
        error: "Failed to create conversation",
        message: "Internal server error",
      });
    }
  },
);

// Mark messages as read
router.put(
  "/:id/read",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const conversation = await Conversation.findById(id);

      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found",
          message: "Conversation does not exist",
        });
      }

      // Check if user is participant
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId,
      );

      if (!isParticipant) {
        return res.status(403).json({
          error: "Access denied",
          message: "You are not a participant in this conversation",
        });
      }

      // Mark unread messages from other users as read
      const updated = conversation.messages.filter(
        (msg) => msg.sender.toString() !== userId && msg.status !== "read",
      );

      updated.forEach((msg) => {
        msg.status = "read";
      });

      if (updated.length > 0) {
        await conversation.save();
      }

      res.json({
        message: "Messages marked as read",
        updatedCount: updated.length,
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({
        error: "Failed to mark messages as read",
        message: "Internal server error",
      });
    }
  },
);

export { router as conversationRoutes };
