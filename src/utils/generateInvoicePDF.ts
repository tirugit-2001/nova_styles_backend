import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface InvoiceData {
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
  orderNumber: string;
}

export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create invoices directory if it doesn't exist
    const invoicesDir = path.join(process.cwd(), "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    const doc = new PDFDocument({ margin: 50 });

    // Pipe PDF to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();

    // Company Info (Left)
    doc.fontSize(12);
    doc.text("Nova Styles", 50, 100);
    doc.fontSize(10);
    doc.text("Your Company Address", 50, 120);
    doc.text("City, State, PIN", 50, 135);
    doc.text("Phone: +91-XXXXXXXXXX", 50, 150);
    doc.text("Email: info@novastyles.com", 50, 165);

    // Invoice Details (Right)
    doc.fontSize(12);
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 350, 100, { align: "right" });
    doc.text(`Order #: ${invoiceData.orderNumber}`, 350, 120, { align: "right" });
    doc.text(`Date: ${invoiceData.invoiceDate.toLocaleDateString()}`, 350, 140, { align: "right" });
    doc.text(`Status: ${invoiceData.paymentStatus}`, 350, 160, { align: "right" });

    // Customer Info
    doc.moveDown(3);
    doc.fontSize(12).text("Bill To:", 50);
    doc.fontSize(10);
    doc.text(invoiceData.customerName, 50);
    doc.text(invoiceData.customerAddress.street, 50);
    doc.text(
      `${invoiceData.customerAddress.city}, ${invoiceData.customerAddress.state} ${invoiceData.customerAddress.postalCode}`,
      50
    );
    doc.text(invoiceData.customerAddress.country, 50);
    doc.text(`Phone: ${invoiceData.customerAddress.phone}`, 50);
    doc.text(`Email: ${invoiceData.customerEmail}`, 50);

    // Items Table
    doc.moveDown(2);
    const tableTop = doc.y;
    const itemHeight = 30;

    // Table Header
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Item", 50, tableTop);
    doc.text("Qty", 200, tableTop);
    doc.text("Area", 250, tableTop);
    doc.text("Price", 300, tableTop);
    doc.text("Total", 400, tableTop, { align: "right" });

    // Table Items
    doc.font("Helvetica");
    let y = tableTop + itemHeight;
    invoiceData.items.forEach((item) => {
      doc.text(item.name, 50, y, { width: 140 });
      doc.text(item.quantity.toString(), 200, y);
      doc.text((item.area || 0).toString(), 250, y);
      doc.text(`₹${item.price.toLocaleString("en-IN")}`, 300, y);
      doc.text(`₹${item.total.toLocaleString("en-IN")}`, 400, y, { align: "right" });
      y += itemHeight;
    });

    // Total Section
    const totalY = y + 10;
    doc.font("Helvetica-Bold");
    doc.text("Subtotal:", 300, totalY);
    doc.text(`₹${invoiceData.subtotal.toLocaleString("en-IN")}`, 400, totalY, { align: "right" });

    if (invoiceData.tax > 0) {
      doc.text("Tax:", 300, totalY + 20);
      doc.text(`₹${invoiceData.tax.toLocaleString("en-IN")}`, 400, totalY + 20, { align: "right" });
    }

    doc.fontSize(12);
    doc.text("Total:", 300, totalY + 40);
    doc.text(`₹${invoiceData.total.toLocaleString("en-IN")}`, 400, totalY + 40, { align: "right" });

    // Payment Method
    doc.moveDown(2);
    doc.fontSize(10);
    doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 50);
    doc.text(`Payment Status: ${invoiceData.paymentStatus}`, 50);

    // Footer
    doc.fontSize(8);
    doc.text("Thank you for your business!", 50, doc.page.height - 50, { align: "center" });

    // Finalize PDF
    doc.end();

    stream.on("finish", () => {
      resolve(filePath);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
};