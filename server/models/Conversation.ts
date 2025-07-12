import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "file" | "system";
  status: "sent" | "delivered" | "read";
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
}

interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  swapRequest?: mongoose.Types.ObjectId;
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    swapRequest: {
      type: Schema.Types.ObjectId,
      ref: "SwapRequest",
    },
    lastMessage: {
      content: {
        type: String,
        trim: true,
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  },
);

// Ensure participants array has exactly 2 users and no duplicates
conversationSchema.index({ participants: 1 }, { unique: true });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
export const Message = mongoose.model<IMessage>("Message", messageSchema);
export type { IConversation, IMessage };
