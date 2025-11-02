import mongoose, { Schema, Document } from "mongoose";
import { IOrder, IOrderItem } from "../types";

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    imageUrl: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    addressId: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online", "cash"],
      required: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "confirmed",
      ],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
