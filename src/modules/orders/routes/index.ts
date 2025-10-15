import express from "express";
import verifyUser from "../../../middlewares/verifyUser";
const router = express.Router();
router.use(verifyUser);

import orderController from "../controllers/order.controller";

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.get("/user/:userId", orderController.getOrdersByUser);
router.put("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);

export default router;
