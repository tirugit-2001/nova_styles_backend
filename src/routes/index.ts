import express from "express";
const router = express.Router();
import authrouter from "../modules/auth/routes";
import productrouter from "../modules/products/routes";
import cartrouter from "../modules/cart/routes/cart.route";
import orderrouter from "../modules/orders/routes/";
import paymentrouter from "../modules/payment/routes";
import WebFrontRounter from "../modules/webFront/routes";

router.use("/auth", authrouter);
router.use("/product", productrouter);
router.use("/cart", cartrouter);
router.use("/orders", orderrouter);
router.use("/payments", paymentrouter);

router.use("/heroContent", WebFrontRounter);


export default router;
