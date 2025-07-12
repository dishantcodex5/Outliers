import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap";

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);

    // In development, continue without MongoDB for demo purposes
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      console.log("🔄 Running in development mode without MongoDB");
      console.log("💡 To use full functionality, install and start MongoDB:");
      console.log("   brew install mongodb/brew/mongodb-community (macOS)");
      console.log("   sudo apt-get install mongodb (Ubuntu)");
      console.log("   or use MongoDB Atlas cloud database");
      return;
    }

    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
});
