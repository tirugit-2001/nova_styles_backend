import mongoose, { Schema, Document } from "mongoose";

export interface IInteriorEstimation extends Document {
  // Contact Info
  name: string;
  email: string;
  mobile: string;
  pincode?: string;
  whatsappUpdates: boolean;

  // Project Details
  interiorType: string;
  floorplan?: string;
  purpose?: string;

  // Package & Pricing
  selectedPackage?: string;
  addons?: string[];
  packagePrice?: number;
  addonsTotal?: number;
  totalPrice?: number;

  // Notes
  message?: string;

  // Attachment Info
  hasAttachment: boolean;
  attachmentFilename?: string;
  attachmentFilePath?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const interiorEstimationSchema = new Schema<IInteriorEstimation>(
  {
    // Contact Info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    whatsappUpdates: {
      type: Boolean,
      default: false,
    },

    // Project Details
    interiorType: {
      type: String,
      required: [true, "Interior type is required"],
      trim: true,
    },
    floorplan: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
    },

    // Package & Pricing
    selectedPackage: {
      type: String,
      trim: true,
    },
    addons: {
      type: [String],
      default: [],
    },
    packagePrice: {
      type: Number,
      min: [0, "Package price cannot be negative"],
    },
    addonsTotal: {
      type: Number,
      min: [0, "Addons total cannot be negative"],
    },
    totalPrice: {
      type: Number,
      min: [0, "Total price cannot be negative"],
    },

    // Notes
    message: {
      type: String,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    // Attachment Info
    hasAttachment: {
      type: Boolean,
      default: false,
    },
    attachmentFilename: {
      type: String,
      trim: true,
    },
    attachmentFilePath: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
interiorEstimationSchema.index({ email: 1 });
interiorEstimationSchema.index({ createdAt: -1 });
interiorEstimationSchema.index({ interiorType: 1 });

const InteriorEstimation = mongoose.model<IInteriorEstimation>(
  "InteriorEstimation",
  interiorEstimationSchema
);

export default InteriorEstimation;

