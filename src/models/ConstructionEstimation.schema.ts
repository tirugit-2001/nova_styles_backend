import mongoose, { Schema, Document } from "mongoose";

export interface IConstructionEstimation extends Document {
  // Contact Info
  name: string;
  email: string;
  mobile: string;
  pincode?: string;
  whatsappUpdates: boolean;

  // Project Details
  projectType?: string;
  buildingType?: string;
  plotSize?: string;
  builtUpArea?: string;
  sqft?: number;
  ratePerSqft?: number;

  // Package & Pricing
  selectedPackage?: string;
  packagePrice?: number;
  totalPrice?: number;
  estimatedPrice?: number;

  // Requirements & Notes
  requirements?: mongoose.Schema.Types.Mixed;
  message?: string;
  suggestions?: string;
  constructionType?: string;

  // Attachment Info
  hasAttachment: boolean;
  attachmentFilename?: string;
  attachmentFilePath?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const constructionEstimationSchema = new Schema<IConstructionEstimation>(
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
    projectType: {
      type: String,
      trim: true,
    },
    buildingType: {
      type: String,
      trim: true,
    },
    plotSize: {
      type: String,
      trim: true,
    },
    builtUpArea: {
      type: String,
      trim: true,
    },
    sqft: {
      type: Number,
      min: [0, "Sqft cannot be negative"],
    },
    ratePerSqft: {
      type: Number,
      min: [0, "Rate per sqft cannot be negative"],
    },

    // Package & Pricing
    selectedPackage: {
      type: String,
      trim: true,
    },
    packagePrice: {
      type: Number,
      min: [0, "Package price cannot be negative"],
    },
    totalPrice: {
      type: Number,
      min: [0, "Total price cannot be negative"],
    },
    estimatedPrice: {
      type: Number,
      min: [0, "Estimated price cannot be negative"],
    },

    // Requirements & Notes
    requirements: {
      type: Schema.Types.Mixed,
    },
    message: {
      type: String,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    suggestions: {
      type: String,
      maxlength: [2000, "Suggestions cannot exceed 2000 characters"],
    },
    constructionType: {
      type: String,
      trim: true,
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
constructionEstimationSchema.index({ email: 1 });
constructionEstimationSchema.index({ createdAt: -1 });
constructionEstimationSchema.index({ buildingType: 1 });
constructionEstimationSchema.index({ projectType: 1 });

const ConstructionEstimation = mongoose.model<IConstructionEstimation>(
  "ConstructionEstimation",
  constructionEstimationSchema
);

export default ConstructionEstimation;

