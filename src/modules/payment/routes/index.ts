import express from "express";
import paymentController from "../controllers/payment.controllers";
import verifyUser from "../../../middlewares/verifyUser";

const router = express.Router();
router.use(verifyUser);
router.post("/create-order", paymentController.createPaymentOrder);
router.post("/verify", paymentController.verifyPayment);
router.post("/razorpay", express.raw({ type: "application/json" }));
export default router;
