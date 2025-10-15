import mongoose, { Schema, Document } from "mongoose";
import { IContent } from "../types";

const contentSchema = new Schema<IContent>(
  {
    section: {
      type: String,
      enum: ["banner", "services", "testimonials"],
      required: true,
    },
    title: String,
    subtitle: String,
    description: String,
    image: String,
    order: Number,
  },
  { timestamps: true }
);

const Content = mongoose.model<IContent>("Content", contentSchema);
export default Content;
