import express from "express";
import paymentwebhook from "../../payment/controllers/webhook.controller";
const router = express.Router();
router.get("/");
router.get("/:id");
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentwebhook.razorpayWebhook
);
export default router;
