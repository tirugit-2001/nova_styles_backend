import mongoose, { Schema, Document } from "mongoose";
import { IOrder, IOrderItem } from "../types";

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    area: Number,
    selectedColor: String,
    selectedTexture: String,
  },
  { _id: false }
);

// NEW: Order History Schema for tracking status changes
const orderHistorySchema = new Schema({
  status: { type: String, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin who made change
  updatedAt: { type: Date, default: Date.now },
  notes: String, // Optional notes about the status change
  location: String, // Delivery location if applicable
}, { _id: false });

// NEW: Shipment Tracking Schema
const shipmentTrackingSchema = new Schema({
  location: { type: String, required: true }, // Current location
  status: { type: String, required: true }, // "In Transit", "Out for Delivery", "Delivered"
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }, // Admin who updated
  notes: String, // Additional tracking notes
}, { _id: false });

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
    },
     // NEW FIELDS:
  orderNumber: { type: String, unique: true, required: true }, // Human-readable order number (e.g., "ORD-2024-001234")
  invoiceNumber: { type: String, unique: true, sparse: true }, // Invoice number when generated
  invoiceGenerated: { type: Boolean, default: false },
  invoiceGeneratedAt: Date,
  history: [orderHistorySchema], // Track all status changes
  tracking: [shipmentTrackingSchema], // Track delivery locations
  currentLocation: String, // Current delivery location
  completedAt: Date, // When order was marked completed
  cancelledAt: Date, // When order was cancelled
  cancellationReason: String, // Reason for cancellation
  adminNotes: String, 
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre("save", async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});



const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
