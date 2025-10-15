import express from "express";
import adminProductRoutes from "./product.route";
import adminUserRoutes from "./users.route";
import homepageRoutes from "../../content/route.ts/content.route";
import adminDashboardRoutes from "./dashboard.route";
import adminOrderRoutes from "./order.route";
import adminPaymentRoutes from "./payment.route";
const router = express.Router();
router.use("/users", adminUserRoutes);
router.use("/dashboard", adminDashboardRoutes);
router.use("/product", adminProductRoutes);
router.use("/orders", adminOrderRoutes);
router.use("/payment", adminPaymentRoutes);
router.use("/homepage", homepageRoutes);

export default router;
