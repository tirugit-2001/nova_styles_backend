import Order from "../../../models/order.schema";
import mongoose from "mongoose";

const findAll = async (filters: any = {}) => {
  const query: any = {};
  
  // Status filter - handle case-insensitive matching (database may have inconsistent casing)
  if (filters.status && typeof filters.status === 'string' && filters.status.trim() !== '') {
    // Escape special regex characters in status
    const escapedStatus = filters.status.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use case-insensitive regex to match status regardless of casing in database
    query.status = { $regex: new RegExp(`^${escapedStatus}$`, "i") };
  }
  
  // Payment method filter - only apply if paymentMethod is provided and matches enum
  if (filters.paymentMethod && typeof filters.paymentMethod === 'string' && filters.paymentMethod.trim() !== '') {
    // Use exact match for payment method (enum values are strict)
    query.paymentMethod = filters.paymentMethod;
  }
  
  // Date range filter - support both createdAt (order placed date) and delivery date
  if ((filters.startDate && typeof filters.startDate === 'string' && filters.startDate.trim() !== '') || 
      (filters.endDate && typeof filters.endDate === 'string' && filters.endDate.trim() !== '')) {
    query.createdAt = {};
    if (filters.startDate && typeof filters.startDate === 'string' && filters.startDate.trim() !== '') {
      // Parse date string (format: YYYY-MM-DD) and set to start of day in UTC
      // This ensures consistent date filtering regardless of server timezone
      const dateParts = filters.startDate.split('-');
      let start: Date;
      if (dateParts.length === 3) {
        // Create date in UTC to avoid timezone issues
        start = new Date(Date.UTC(
          parseInt(dateParts[0]), 
          parseInt(dateParts[1]) - 1, 
          parseInt(dateParts[2]), 
          0, 0, 0, 0
        ));
      } else {
        // Fallback to standard date parsing
        start = new Date(filters.startDate + 'T00:00:00.000Z');
      }
      query.createdAt.$gte = start;
    }
    if (filters.endDate && typeof filters.endDate === 'string' && filters.endDate.trim() !== '') {
      // Parse date string (format: YYYY-MM-DD) and set to end of day in UTC
      const dateParts = filters.endDate.split('-');
      let end: Date;
      if (dateParts.length === 3) {
        // Create date in UTC to avoid timezone issues
        end = new Date(Date.UTC(
          parseInt(dateParts[0]), 
          parseInt(dateParts[1]) - 1, 
          parseInt(dateParts[2]), 
          23, 59, 59, 999
        ));
      } else {
        // Fallback to standard date parsing
        end = new Date(filters.endDate + 'T23:59:59.999Z');
      }
      query.createdAt.$lte = end;
    }
  }
  
  // Customer search (by userIds from service layer)
  if (filters.userIds && filters.userIds.length > 0) {
    query.userId = { $in: filters.userIds };
  }
  
  // Order number search - case-insensitive partial match
  if (filters.orderNumber && typeof filters.orderNumber === 'string' && filters.orderNumber.trim() !== '') {
    // Escape special regex characters
    const escapedOrderNumber = filters.orderNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.orderNumber = { $regex: escapedOrderNumber, $options: "i" };
  }

  return Order.find(query)
    .populate("userId", "username email phone")
    .populate("addressId")
    .populate("paymentId")
    .populate("items.productId")
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .skip(filters.skip || 0);
};

const findById = async (id: string) => {
  return Order.findById(id)
    .populate("userId", "username email phone")
    .populate("addressId")
    .populate("paymentId")
    .populate("items.productId")
    .populate("history.updatedBy", "username email")
    .populate("tracking.updatedBy", "username email");
};

const updateStatus = async (
  id: string,
  status: string,
  adminId: string,
  notes?: string,
  location?: string
) => {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  // Add to history
  const historyEntry = {
    status,
    updatedBy: new mongoose.Types.ObjectId(adminId),
    updatedAt: new Date(),
    notes,
    location,
  };

  // Update status and history
  const updateData: any = {
    status,
    $push: { history: historyEntry },
  };

  // Set completion/cancellation dates
  if (status === "Completed") {
    updateData.completedAt = new Date();
  } else if (status === "Cancelled") {
    updateData.cancelledAt = new Date();
  }

  return Order.findByIdAndUpdate(id, updateData, { new: true });
};

const updateLocation = async (
  id: string,
  location: string,
  adminId: string,
  notes?: string
) => {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  const trackingEntry = {
    location,
    status: order.status,
    updatedAt: new Date(),
    updatedBy: new mongoose.Types.ObjectId(adminId),
    notes,
  };

  return Order.findByIdAndUpdate(
    id,
    {
      currentLocation: location,
      $push: { tracking: trackingEntry },
    },
    { new: true }
  );
};

const addTrackingEntry = async (
  id: string,
  location: string,
  status: string,
  adminId: string,
  notes?: string
) => {
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  const trackingEntry = {
    location,
    status,
    updatedAt: new Date(),
    updatedBy: new mongoose.Types.ObjectId(adminId),
    notes,
  };

  return Order.findByIdAndUpdate(
    id,
    {
      currentLocation: location,
      $push: { tracking: trackingEntry },
    },
    { new: true }
  );
};

const addAdminNotes = async (id: string, notes: string) => {
  return Order.findByIdAndUpdate(
    id,
    { adminNotes: notes },
    { new: true }
  );
};

const getOrderStats = async (filters: any = {}) => {
  const matchQuery: any = {};
  
  if (filters.startDate || filters.endDate) {
    matchQuery.createdAt = {};
    if (filters.startDate) matchQuery.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchQuery.createdAt.$lte = new Date(filters.endDate);
  }

  return Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

const getTotalOrders = async (filters: any = {}) => {
  const query: any = {};
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  return Order.countDocuments(query);
};

const getRevenueStats = async (filters: any = {}) => {
  const matchQuery: any = { status: { $ne: "Cancelled" } };
  
  if (filters.startDate || filters.endDate) {
    matchQuery.createdAt = {};
    if (filters.startDate) matchQuery.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) matchQuery.createdAt.$lte = new Date(filters.endDate);
  }

  return Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);
};

export default {
    findAll,
    findById,
    updateStatus,
    updateLocation,
    addTrackingEntry,
    addAdminNotes,
    getOrderStats,
    getTotalOrders,
    getRevenueStats,
  };