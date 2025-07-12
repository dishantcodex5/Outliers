import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  location: string;
  profilePhoto: string;
  skillsOffered: Array<{
    skill: string;
    description: string;
    isApproved: boolean;
  }>;
  skillsWanted: Array<{
    skill: string;
    description: string;
  }>;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  isPublic: boolean;
  role: "user" | "admin";
  profileCompleted: boolean;
  rating: number;
  totalExchanges: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    skillsOffered: [
      {
        skill: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: "",
          trim: true,
        },
        isApproved: {
          type: Boolean,
          default: true,
        },
      },
    ],
    skillsWanted: [
      {
        skill: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
    availability: {
      weekdays: {
        type: Boolean,
        default: false,
      },
      weekends: {
        type: Boolean,
        default: false,
      },
      mornings: {
        type: Boolean,
        default: false,
      },
      afternoons: {
        type: Boolean,
        default: false,
      },
      evenings: {
        type: Boolean,
        default: false,
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalExchanges: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model<IUser>("User", userSchema);
export type { IUser };
