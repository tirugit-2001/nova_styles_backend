import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Section name is required"], trim: true },
  images: { type: [String], default: [] },
});

const portfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    image: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    showOnMainHome: { type: Boolean, default: false },
    showOnInteriorHome: { type: Boolean, default: false },
    showOnConstruction: { type: Boolean, default: false },
    sections: { type: [SectionSchema], default: [] },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;

 