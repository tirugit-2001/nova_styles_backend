import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "admin"],
  },
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
});
const user = mongoose.model("User", userSchema);
export default user;
