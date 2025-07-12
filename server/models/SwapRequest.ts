import mongoose, { Schema, Document } from "mongoose";

interface ISwapRequest extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  duration: string;
  sessionDetails?: {
    scheduledDate?: Date;
    location?: string;
    type: "in-person" | "online";
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const swapRequestSchema = new Schema<ISwapRequest>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillOffered: {
      type: String,
      required: true,
      trim: true,
    },
    skillWanted: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    duration: {
      type: String,
      default: "1 hour",
      trim: true,
    },
    sessionDetails: {
      scheduledDate: {
        type: Date,
      },
      location: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: ["in-person", "online"],
        default: "online",
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate requests between same users for same skills
swapRequestSchema.index(
  { from: 1, to: 1, skillOffered: 1, skillWanted: 1 },
  { unique: true },
);

export const SwapRequest = mongoose.model<ISwapRequest>(
  "SwapRequest",
  swapRequestSchema,
);
export type { ISwapRequest };
