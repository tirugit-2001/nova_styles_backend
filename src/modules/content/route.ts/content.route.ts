import express from "express";
import contentController from "../controllers/content.controller";
import verifyAdmin from "../../../middlewares/verifyAdmin";
import upload from "../../../middlewares/upload";

const router = express.Router();

// Public routes - specific routes before parameterized ones
router.post("/contact-form", contentController.postContactForm);
router.post("/construction-form", contentController.postConstructionForm);

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
