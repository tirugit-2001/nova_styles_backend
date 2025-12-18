import express from "express";
import paymentController from "../controllers/payment.controllers";
import verifyUser from "../../../middlewares/verifyUser";
import razorpayWebhook from "../controllers/webhook.controller";

const router = express.Router();
router.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);
router.use(verifyUser);
router.post("/create-order", paymentController.createPaymentOrder);
router.post("/verify", paymentController.verifyPayment);

export default router;
