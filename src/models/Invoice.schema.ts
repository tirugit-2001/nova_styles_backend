import mongoose, { Schema, Document } from "mongoose";

interface IInvoice extends Document {
    orderId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    invoiceDate: Date;
    customerName: string;
    customerEmail: string;
    customerAddress:{
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
    },
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        area?:number;
        total: number;
    }>,
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

const invoiceSchema = new Schema<IInvoice>({
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, default: Date.now },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    items: [{
      name: String,
      quantity: Number,
      price: Number,
      area: Number,
      total: Number,
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    pdfPath: { type: String, required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  }, { timestamps: true });

  // Generate invoice number before saving
invoiceSchema.pre("save", async function(next) {
    if (!this.invoiceNumber) {
      const count = await mongoose.model("Invoice").countDocuments();
      const year = new Date().getFullYear();
      this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, "0")}`;
    }
    next();
  });

  const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);
  export default Invoice;