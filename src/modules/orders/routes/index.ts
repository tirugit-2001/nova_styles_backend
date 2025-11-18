import express from "express";
import verifyUser from "../../../middlewares/verifyUser";
import verifyAdmin from "../../../middlewares/verifyAdmin";
const router = express.Router();
router.use(verifyUser);

import orderController from "../controllers/order.controller";
import adminOrderController from "../../admin/controllers/order.controller";

router.get("/", orderController.getAllOrders);
router.get("/user/:userId", orderController.getOrdersByUser);

// Invoice generation (requires admin authentication) - must be before /:id route
router.post("/:id/invoice/generate", verifyAdmin, adminOrderController.generateInvoice);

router.get("/:id", orderController.getOrderById);
router.put("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);

export default router;
