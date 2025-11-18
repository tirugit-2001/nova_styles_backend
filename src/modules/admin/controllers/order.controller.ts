import { Request, Response, NextFunction } from "express";
import orderService from "../service/order.service";
import Invoice from "../../../models/Invoice.schema";
import path from "path";
import fs from "fs";

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Support both dateFrom/dateTo and startDate/endDate
    const startDate = (req.query.dateFrom || req.query.startDate) as string;
    const endDate = (req.query.dateTo || req.query.endDate) as string;
    
    // Support both paymentMode and paymentMethod (normalize to match enum values)
    // Valid enum values: ["COD", "Online", "cash"]
    const paymentMode = (req.query.paymentMode || req.query.paymentMethod) as string;
    let normalizedPaymentMethod: string | undefined;
    if (paymentMode) {
      const lowerMode = paymentMode.toLowerCase();
      if (lowerMode === 'cod') {
        normalizedPaymentMethod = 'COD';
      } else if (lowerMode === 'online') {
        normalizedPaymentMethod = 'Online';
      } else if (lowerMode === 'cash') {
        normalizedPaymentMethod = 'cash';
      } else {
        // If it doesn't match known values, set to undefined to skip filter
        // This prevents invalid filters from breaking the query
        normalizedPaymentMethod = undefined;
      }
    }

    // Support customer name search (customerName or customerSearch)
    const customerSearch = (req.query.customerName || req.query.customerSearch) as string;
    
    // Support generic search - can be customer name OR order number
    const search = req.query.search as string;
    
    // If generic search is provided, check if it looks like an order number (starts with ORD-)
    // Otherwise treat it as customer search
    let orderNumber: string | undefined;
    let finalCustomerSearch: string | undefined;
    
    if (search) {
      if (search.toUpperCase().startsWith('ORD-')) {
        // It's an order number
        orderNumber = search;
      } else {
        // It's a customer search
        finalCustomerSearch = search;
      }
    } else {
      finalCustomerSearch = customerSearch;
      orderNumber = req.query.orderNumber as string;
    }

    const filters = {
      status: req.query.status as string,
      paymentMethod: normalizedPaymentMethod,
      startDate: startDate,
      endDate: endDate,
      customerSearch: finalCustomerSearch,
      orderNumber: orderNumber,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      skip: req.query.skip ? parseInt(req.query.skip as string) : 0,
    };

    const orders = await orderService.getAllOrders(filters);
    
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
      count: orders.length,
    });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, notes, location } = req.body;
    const adminId = (req as any).user._id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      adminId,
      notes,
      location
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, notes } = req.body;
    const adminId = (req as any).user._id;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    const order = await orderService.updateOrderLocation(
      req.params.id,
      location,
      adminId,
      notes
    );

    res.status(200).json({
      success: true,
      message: "Order location updated successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

const addTrackingEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, status, notes } = req.body;
    const adminId = (req as any).user?._id;

    if (!location || !status) {
      return res.status(400).json({
        success: false,
        message: "Location and status are required",
      });
    }

    const order = await orderService.addTrackingEntry(req.params.id, {
      location,
      status,
      notes,
      adminId,
    });

    res.status(200).json({
      success: true,
      message: "Tracking entry added successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

const notifyCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    const result = await orderService.sendOrderUpdateNotification(
      req.params.id,
      message
    );

    res.status(200).json({
      success: true,
      message: "Order update email sent successfully",
      result,
    });
  } catch (err) {
    next(err);
  }
};

const addAdminNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: "Notes are required",
      });
    }

    const order = await orderService.addAdminNotes(req.params.id, notes);

    res.status(200).json({
      success: true,
      message: "Admin notes added successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

const generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user._id;
    const invoice = await orderService.generateInvoice(req.params.id, adminId);

    res.status(200).json({
      success: true,
      message: "Invoice generated successfully",
      invoice: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        pdfPath: invoice.pdfPath,
        createdAt: invoice.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

const downloadInvoiceByOrderId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findOne({ orderId: req.params.id });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found for this order",
      });
    }

    // Normalize the path - handle both absolute and relative paths
    let filePath = invoice.pdfPath;
    
    // If path is absolute, use it directly; otherwise make it relative to project root
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice PDF file not found on server",
      });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);

    // Send PDF file - use absolute path without root option
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

const downloadInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Normalize the path - handle both absolute and relative paths
    let filePath = invoice.pdfPath;
    
    // If path is absolute, use it directly; otherwise make it relative to project root
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice PDF file not found on server",
      });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);

    // Send PDF file - use absolute path without root option
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

const getOrderStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const stats = await orderService.getOrderStats(filters);
    const totalOrders = await orderService.getTotalOrders(filters);
    const revenueStats = await orderService.getRevenueStats(filters);

    res.status(200).json({
      success: true,
      message: "Order statistics fetched successfully",
      stats: {
        byStatus: stats,
        totalOrders,
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderLocation,
  addTrackingEntry,
  notifyCustomer,
  addAdminNotes,
  generateInvoice,
  downloadInvoiceByOrderId,
  downloadInvoice,
  getOrderStats,
};