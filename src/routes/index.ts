import express from "express";
const router = express.Router();
import authrouter from "../modules/auth/routes";
import productrouter from "../modules/products/routes";
import cartrouter from "../modules/cart/routes/cart.route";
import orderrouter from "../modules/orders/routes/";
import paymentrouter from "../modules/payment/routes";
import WebFrontRounter from "../modules/webFront/routes";

import userrouter from "../modules/users/routes";
import contentrouter from "../modules/content/route.ts/content.route";
import portfoliorouter from "../modules/portfolio/routes/portfolio.route";
import adminOrderRoutes from "../modules/admin/routes/order.route";
router.use("/auth", authrouter);
router.use("/product", productrouter);
router.use("/cart", cartrouter);
router.use("/orders", orderrouter);
router.use("/payments", paymentrouter);
router.use("/heroContent", WebFrontRounter);
router.use("/users", userrouter);
router.use("/content", contentrouter);
router.use("/portfolioContent", portfoliorouter);
router.use("/admin/orders", adminOrderRoutes);

export default router;
