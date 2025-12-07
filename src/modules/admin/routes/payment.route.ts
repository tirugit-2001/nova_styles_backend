import express from "express";
import razorpayWebhook from "../../payment/controllers/webhook.controller";
const router = express.Router();
router.get("/");
router.get("/:id");
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);
export default router;
