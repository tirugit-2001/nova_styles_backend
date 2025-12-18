import express from "express";
import { Request, Response } from "express";
import paymentwebhook from "../../payment/controllers/webhook.controller";

const router = express.Router();

// #region agent log
fetch('http://127.0.0.1:7242/ingest/6426e5d0-c3f0-42f5-bca8-b6c9f07a3b9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment.route.ts:12',message:'Payment routes module loading',data:{routesDefined:3},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Placeholder handlers - implement these when needed
router.get("/", (req: Request, res: Response) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6426e5d0-c3f0-42f5-bca8-b6c9f07a3b9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment.route.ts:16',message:'GET / payment route handler called',data:{path:req.path},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.get("/:id", (req: Request, res: Response) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6426e5d0-c3f0-42f5-bca8-b6c9f07a3b9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment.route.ts:22',message:'GET /:id payment route handler called',data:{id:req.params.id},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentwebhook.razorpayWebhook
);

// #region agent log
fetch('http://127.0.0.1:7242/ingest/6426e5d0-c3f0-42f5-bca8-b6c9f07a3b9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment.route.ts:32',message:'Payment routes module loaded successfully',data:{allRoutesHaveHandlers:true},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion

export default router;
