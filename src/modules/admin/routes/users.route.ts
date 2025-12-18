import express from "express";
import { Request, Response } from "express";

const router = express.Router();

// Placeholder handlers - implement these when needed
router.get("/", (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.get("/:id", (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.delete("/:id", (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

router.put("/:id", (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: "Not implemented yet" });
});

export default router;
