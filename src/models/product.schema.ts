import { required } from "joi";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    oldPrice: {
      type: Number,
      maxlength: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    paperTextures: [
      {
        type: String,
        trim: true,
      },
    ],
    colours: [
      {
        type: String,
        trim: true,
      },
    ],
    material: [
      {
        type: String,
        trim: true,
      },
    ],
    print: [
      {
        type: String,
        trim: true,
      },
    ],
    installation: [
      {
        type: String,
        trim: true,
      },
    ],
    application: [
      {
        type: String,
        trim: true,
      },
    ],
    image: {
      type: String,
      // required: true,
      // validate: {
      //   validator: function (v: string) {
      //     return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/.test(v);
      //   },
      //   message: "Invalid image URL format",
      // },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
