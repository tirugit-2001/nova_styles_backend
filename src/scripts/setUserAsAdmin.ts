import mongoose from "mongoose";
import config from "../config/config";
import user from "../models/user.schema";

const setUserAsAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI);
    console.log("✅ Connected to MongoDB");

    const userEmail = "admin@nova.com";

    // Find and update user
    const updatedUser = await user.findOneAndUpdate(
      { email: userEmail },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ User not found with email:", userEmail);
      await mongoose.disconnect();
      return;
    }

    console.log("✅ User updated to admin successfully!");
    console.log("Email:", updatedUser.email);
    console.log("Username:", updatedUser.username);
    console.log("Role:", updatedUser.role);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error updating user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
setUserAsAdmin();

