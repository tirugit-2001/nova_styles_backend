import express from "express";
import paymentController from "../controllers/payment.controllers";

const router = express.Router();

router.post("/create-order", paymentController.createPaymentOrder);
router.post("/verify", paymentController.verifyPayment);

export default router;
