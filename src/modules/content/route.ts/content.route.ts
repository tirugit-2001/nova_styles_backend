import express, { RequestHandler } from "express";
import contentController from "../controllers/content.controller";
import verifyAdmin from "../../../middlewares/verifyAdmin";
import upload from "../../../middlewares/upload";

const router = express.Router();

const mapConstructionUpload: RequestHandler = (req, _res, next) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  req.file = files?.projectBrief?.[0] ?? files?.planPdf?.[0] ?? undefined;
  next();
};

// Public routes - specific routes before parameterized ones
router.post(
  "/contact-form",
  upload.single("planPdf"),
  contentController.postContactForm
);
router.post(
  "/construction-form",
  upload.fields([
    { name: "projectBrief", maxCount: 1 },
    { name: "planPdf", maxCount: 1 },
  ]),
  mapConstructionUpload,
  contentController.postConstructionForm
);

// Parameterized routes
router.get("/:section", contentController.getContentBySection);
router.get("/:id", contentController.getContentBySection);

// Admin routes
router.post(
  "/",
  verifyAdmin,
  upload.single("image"),
  contentController.createContent
);
router.put(
  "/:id",
  verifyAdmin,
  upload.single("image"),
  contentController.updateContent
);
router.delete("/:id", verifyAdmin, contentController.deleteContent);

export default router;
