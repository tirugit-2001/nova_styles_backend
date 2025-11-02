import mongoose, { Schema, Document } from "mongoose";
import { IPayment } from "../types";

const paymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created",
    },
    method: { type: String },
    verifiedVia: {
      type: String,
      enum: ["client-verify", "webhook"],
      default: null,
    },
    error: {
      code: String,
      description: String,
    },
  },
  { timestamps: true }
);
const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
export default Payment;
