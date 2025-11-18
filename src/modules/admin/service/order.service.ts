import orderRepository from "../repository/order.repository";
import Apperror from "../../../utils/apperror";
import Address from "../../../models/address.schema";
import User from "../../../models/user.schema";
import Invoice from "../../../models/Invoice.schema";
import Order from "../../../models/order.schema";
import { generateInvoicePDF } from "../../../utils/generateInvoicePDF";
import { sendOrderUpdateEmail } from "../../../helpers/sendemail";

const getAllOrders = async (filters: any = {}) => {
  // Handle customer search by email/name
  if (filters.customerSearch) {
    const users = await User.find({
      $or: [
        { email: { $regex: filters.customerSearch, $options: "i" } },
        { username: { $regex: filters.customerSearch, $options: "i" } },
      ],
    }).select("_id");
    
    const userIds = users.map((u) => u._id);
    
    // If customer search is provided but no users found, return empty array
    if (userIds.length === 0) {
      return [];
    }
    
    filters.userIds = userIds;
  }

  return await orderRepository.findAll(filters);
};

const getOrderById = async (id: string) => {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new Apperror("Order not found", 404);
  }
  return order;
};

const updateOrderStatus = async (
  id: string,
  status: string,
  adminId: string,
  notes?: string,
  location?: string
) => {
  const validStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Completed",
    "Cancelled",
  ];

  if (!validStatuses.includes(status)) {
    throw new Apperror("Invalid status", 400);
  }

  const order = await orderRepository.updateStatus(id, status, adminId, notes, location);
  
  if (!order) {
    throw new Apperror("Order not found", 404);
  }

  return order;
};

const updateOrderLocation = async (
  id: string,
  location: string,
  adminId: string,
  notes?: string
) => {
  const order = await orderRepository.updateLocation(id, location, adminId, notes);
  
  if (!order) {
    throw new Apperror("Order not found", 404);
  }

  return order;
};

const addTrackingEntry = async (
  id: string,
  data: { location: string; status: string; notes?: string; adminId: string }
) => {
  const order = await orderRepository.addTrackingEntry(
    id,
    data.location,
    data.status,
    data.adminId,
    data.notes
  );

  if (!order) {
    throw new Apperror("Order not found", 404);
  }

  return order;
};

const addAdminNotes = async (id: string, notes: string) => {
  const order = await orderRepository.addAdminNotes(id, notes);
  
  if (!order) {
    throw new Apperror("Order not found", 404);
  }

  return order;
};

const sendOrderUpdateNotification = async (
  orderId: string,
  message?: string
) => {
  const order = await Order.findById(orderId)
    .populate("userId")
    .populate("addressId")
    .lean();

  if (!order) {
    throw new Apperror("Order not found", 404);
  }

  const user = order.userId as any;
  const address = order.addressId as any;
  const recipientEmail = user?.email || address?.email;

  if (!recipientEmail) {
    throw new Apperror("Customer email not found for this order", 400);
  }

  const latestTracking =
    Array.isArray(order.tracking) && order.tracking.length > 0
      ? order.tracking[order.tracking.length - 1]
      : undefined;

  const customerName =
    user?.username ||
    [address?.firstName, address?.lastName].filter(Boolean).join(" ").trim() ||
    "Customer";

  await sendOrderUpdateEmail(recipientEmail, {
    orderNumber: order.orderNumber || `ORD-${order._id}`,
    status: order.status,
    totalAmount: order.totalAmount,
    tracking: latestTracking,
    customerName,
    message,
  });

  return {
    email: recipientEmail,
    status: order.status,
    tracking: latestTracking,
  };
};

const generateInvoice = async (orderId: string, adminId: string) => {
    const order = await Order.findById(orderId)
      .populate("userId")
      .populate("addressId")
      .populate("paymentId");
    
    if (!order) {
      throw new Apperror("Order not found", 404);
    }
  
    // Check if invoice already exists
    let invoice = await Invoice.findOne({ orderId });
    
    if (invoice) {
      return invoice; // Return existing invoice
    }
  
    // Get customer details
    const user = order.userId as any;
    const address = order.addressId as any;
    const payment = order.paymentId as any;
  
    // Prepare invoice data
    const invoiceData = {
      orderId: order._id,
      invoiceDate: new Date(),
      customerName: `${address.firstName} ${address.lastName}`,
      customerEmail: address.email || user.email,
      customerAddress: {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone || user.phone,
      },
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        area: item.area || 0,
        total: item.price * item.quantity * (item.area || 1),
      })),
      subtotal: order.totalAmount,
      tax: 0, // Calculate tax if needed
      total: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: payment?.status === "success" ? "Paid" : "Pending",
      generatedBy: adminId,
    };

    // Add missing invoiceNumber and orderNumber for InvoiceData type
    const generatedInvoiceNumber = `INV-${Date.now()}`;
    const orderNumber = order.orderNumber || `ORD-${order._id}`;

    // Generate PDF (now with correct InvoiceData shape)
    const pdfPath = await generateInvoicePDF({
      ...invoiceData,
      invoiceNumber: generatedInvoiceNumber,
      orderNumber: orderNumber,
    });

    // Create invoice record with all required fields
    invoice = await Invoice.create({
      ...invoiceData,
      invoiceNumber: generatedInvoiceNumber,
      orderNumber: orderNumber,
      pdfPath,
    });
     
  
    // Update order with invoice info
    await Order.findByIdAndUpdate(orderId, {
      invoiceNumber: invoice.invoiceNumber,
      invoiceGenerated: true,
      invoiceGeneratedAt: new Date(),
    });
  
    return invoice;
  };
  
  const getOrderStats = async (filters: any = {}) => {
    return await orderRepository.getOrderStats(filters);
  };
  
  const getTotalOrders = async (filters: any = {}) => {
    return await orderRepository.getTotalOrders(filters);
  };
  
  const getRevenueStats = async (filters: any = {}) => {
    return await orderRepository.getRevenueStats(filters);
  };
  
  export default {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updateOrderLocation,
  addTrackingEntry,
    addAdminNotes,
    generateInvoice,
  sendOrderUpdateNotification,
    getOrderStats,
    getTotalOrders,
    getRevenueStats,
  };