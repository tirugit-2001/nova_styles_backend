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
  paymentMethod: "COD" | "Online" | "cash";
  paymentId?: mongoose.Types.ObjectId;
  status: "Pending" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Completed" | "Cancelled";
  orderNumber: string;
  invoiceNumber?: string;
  invoiceGenerated: boolean;
  invoiceGeneratedAt?: Date;
  history: IOrderHistory[];
  tracking: IShipmentTracking[];
  currentLocation?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
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
interface IOrderHistory {
  status: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
  notes?: string;
  location?: string;
}

interface IShipmentTracking {
  location: string;
  status: string;
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

interface IInvoice extends Document {
  orderId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerEmail: string;
  customerAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    area?: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  pdfPath: string;
  generatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export {
  IAddress,
  ICart,
  ICartItem,
  ICartInput,
  IInvoice,
  IOrder,
  IOrderItem,
  IPayment,
  IContent,
};
