import express, { Request, Response } from "express";
import razorpayWebhook from "../../payment/controllers/webhook.controller";

const router = express.Router();

// Placeholder handlers - implement these when needed
router.get("/", (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.get("/:id", (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;
