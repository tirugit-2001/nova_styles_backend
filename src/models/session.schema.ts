import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deviceId: { type: String, required: true },
    refreshToken: { type: String, required: true },
    deviceName: { type: String },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
