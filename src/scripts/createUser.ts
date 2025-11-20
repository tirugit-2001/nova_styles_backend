import mongoose from "mongoose";
import config from "../config/config";
import user from "../models/user.schema";
import { hashPassword } from "../utils/password";

const createUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI);
    console.log("✅ Connected to MongoDB");

    // User details
    const userEmail = "NovaAdmin@nova.com";
    const userPassword = "nova123";
    const username = "Nova Admin";
    const phone = "9999999999";
    const role = "admin";

    // Check if user already exists
    const existingUser = await user.findOne({ email: userEmail });
    if (existingUser) {
      console.log("⚠️  User already exists with email:", userEmail);
      console.log("Email:", existingUser.email);
      console.log("Username:", existingUser.username);
      console.log("Role:", existingUser.role || "user");
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = hashPassword(userPassword);

    // Create new user
    const newUser = new user({
      username,
      email: userEmail,
      password: hashedPassword,
      phone: parseInt(phone),
      role: role,
    });

    await newUser.save();

    console.log("✅ User created successfully!");
    console.log("Email:", newUser.email);
    console.log("Username:", newUser.username);
    console.log("Role:", newUser.role);
    console.log("Phone:", newUser.phone);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error creating user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
createUser();

