import mongoose, { Schema, Document } from "mongoose";
import { ICart } from "../types";

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        selectedColor: { type: String },
        selectedTexture: { type: String },
        area: { type: Number },
        name: { type: String },
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
