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
    doc.text(`Date: ${invoiceData.invoiceDate.toLocaleDateString()}`, 350, 150, { align: "right" });
    doc.text(`Status: ${invoiceData.paymentStatus}`, 350, 170, { align: "right" });

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
    const tableLeft = 50;
    const tableRight = 500;
    const col1Right = 200; // Item column end
    const col2Right = 250; // Qty column end
    const col3Right = 300; // Area column end
    const col4Right = 400; // Price column end
    // Total column ends at tableRight

    // Calculate total section rows (Subtotal, Tax if applicable, Total)
    const totalRows = invoiceData.tax > 0 ? 3 : 2;
    const totalSectionHeight = totalRows * itemHeight;

    // Calculate table bottom including total section
    const itemsSectionBottom = tableTop + itemHeight + (invoiceData.items.length * itemHeight);
    const tableBottom = itemsSectionBottom + totalSectionHeight;

    // Draw table border (including total section)
    doc.rect(tableLeft, tableTop, tableRight - tableLeft, tableBottom - tableTop).stroke();

    // Table Header
    doc.fontSize(10).font("Helvetica-Bold");
    const headerY = tableTop + 10; // Center text vertically in header row
    doc.text("Item", tableLeft + 5, headerY);
    doc.text("Qty", col1Right + 5, headerY);
    doc.text("Area", col2Right + 5, headerY);
    doc.text("Price", col3Right + 5, headerY);
    doc.text("Total", col4Right + 5, headerY, { align: "right" });

    // Draw header row bottom border
    doc.moveTo(tableLeft, tableTop + itemHeight)
      .lineTo(tableRight, tableTop + itemHeight)
      .stroke();

    // Draw vertical column borders (extend to include total section)
    doc.moveTo(col1Right, tableTop)
      .lineTo(col1Right, tableBottom)
      .stroke();
    doc.moveTo(col2Right, tableTop)
      .lineTo(col2Right, tableBottom)
      .stroke();
    doc.moveTo(col3Right, tableTop)
      .lineTo(col3Right, tableBottom)
      .stroke();
    doc.moveTo(col4Right, tableTop)
      .lineTo(col4Right, tableBottom)
      .stroke();

    // Table Items
    doc.font("Helvetica");
    let y = tableTop + itemHeight;
    invoiceData.items.forEach((item, index) => {
      const rowY = y + 10; // Center text vertically in row
      doc.text(item.name, tableLeft + 5, rowY, { width: col1Right - tableLeft - 10 });
      doc.text(item.quantity.toString(), col1Right + 5, rowY);
      doc.text((item.area || 0).toString(), col2Right + 5, rowY);
      doc.text(`₹${item.price.toLocaleString("en-IN")}`, col3Right + 5, rowY);
      doc.text(`₹${item.total.toLocaleString("en-IN")}`, col4Right + 5, rowY, { align: "right" });
      
      // Draw row border between items
      if (index < invoiceData.items.length - 1) {
        doc.moveTo(tableLeft, y + itemHeight)
          .lineTo(tableRight, y + itemHeight)
          .stroke();
      }
      
      y += itemHeight;
    });

    // Draw border between items section and total section
    doc.moveTo(tableLeft, itemsSectionBottom)
      .lineTo(tableRight, itemsSectionBottom)
      .stroke();

    // Total Section (within grid)
    let totalY = itemsSectionBottom;
    doc.font("Helvetica-Bold");
    const subtotalRowY = totalY + 10;
    doc.text("Subtotal:", col3Right + 5, subtotalRowY);
    doc.text(`₹${invoiceData.subtotal.toLocaleString("en-IN")}`, col4Right + 5, subtotalRowY, { align: "right" });
    
    // Draw border after subtotal row
    totalY += itemHeight;
    doc.moveTo(tableLeft, totalY)
      .lineTo(tableRight, totalY)
      .stroke();

    if (invoiceData.tax > 0) {
      const taxRowY = totalY + 10;
      doc.text("Tax:", col3Right + 5, taxRowY);
      doc.text(`₹${invoiceData.tax.toLocaleString("en-IN")}`, col4Right + 5, taxRowY, { align: "right" });
      
      // Draw border after tax row
      totalY += itemHeight;
      doc.moveTo(tableLeft, totalY)
        .lineTo(tableRight, totalY)
        .stroke();
    }

    doc.fontSize(12);
    const finalTotalRowY = totalY + 10;
    doc.text("Total:", col3Right + 5, finalTotalRowY);
    doc.text(`₹${invoiceData.total.toLocaleString("en-IN")}`, col4Right + 5, finalTotalRowY, { align: "right" });

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