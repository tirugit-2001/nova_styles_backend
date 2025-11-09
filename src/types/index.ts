import mongoose, { Document } from "mongoose";

interface IAddress extends Document {
  user: mongoose.Schema.Types.ObjectId;

  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  isDefault?: boolean;
  gstin?: string;
}

interface ICartItem {
  product: mongoose.Schema.Types.ObjectId | string | any; // product reference
  quantity: number;
  area: number; // area in sq. ft
  selectedColor: string; // selected color
  selectedTexture: string; // selected texture
  image: string;
  name: string;
  _id?: string;
}

interface ICartInput {
  user: mongoose.Schema.Types.ObjectId | string;
  items: ICartItem[];
  totalPrice: number;
}
interface ICart extends Document {
  user: mongoose.Schema.Types.ObjectId | string;
  items: ICartItem[];
  totalPrice: number;
}

interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: "created" | "success" | "failed";
  method?: string;
  error?: {
    code: string;
    description: string;
  };
}

// interface IOrderItem extends Document {
//   productId: mongoose.Schema.Types.ObjectId | string;
//   quantity: number;
//   price: number;
//   name: string;
//   imageUrl: string;
// }

// interface IOrder extends Document {
//   user: mongoose.Schema.Types.ObjectId | string;
//   items: IOrderItem[];
//   shippingAddress: IAddress;
//   totalAmount: number;
//   status: "pending" | "shipped" | "delivered" | "canceled";
//   createdAt: Date;
//   updatedAt: Date;
// }
interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  area: number;
  selectedColor: string;
  selectedTexture: string;
}

interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: "COD" | "Online";
  paymentId?: mongoose.Types.ObjectId;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
}
interface IContent extends Document {
  section: "banner" | "services" | "testimonials";
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  order?: number;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email?: string;
        deviceId?: string;
      };
    }
  }
}

export {
  IAddress,
  ICart,
  ICartItem,
  ICartInput,
  IOrder,
  IOrderItem,
  IPayment,
  IContent,
};
