import express from "express";
import orderController from "../controllers/order.controller";
import verifyAdmin from "../../../middlewares/verifyAdmin";
import verifyUser from "../../../middlewares/verifyUser";

const router = express.Router();

// All routes require user authentication first, then admin verification
router.use(verifyUser);
router.use(verifyAdmin);

// Get all orders with filters
router.get("/", orderController.getAllOrders);

// Get order statistics
router.get("/stats", orderController.getOrderStats);

// Get single order by ID
router.get("/:id", orderController.getOrderById);

// Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// Update order location
router.put("/:id/location", orderController.updateOrderLocation);

// Add tracking entry
router.post("/:id/tracking", orderController.addTrackingEntry);

// Send order update email
router.post("/:id/notify", orderController.notifyCustomer);

// Add admin notes
router.put("/:id/notes", orderController.addAdminNotes);

// Generate invoice
router.post("/:id/invoice", orderController.generateInvoice);
router.post("/:id/invoice/generate", orderController.generateInvoice);

// Download invoice PDF by orderId (gets the invoice for the order)
router.get("/:id/invoice", orderController.downloadInvoiceByOrderId);

// Download invoice PDF by invoiceId
router.get("/:id/invoice/:invoiceId/download", orderController.downloadInvoice);

export default router;