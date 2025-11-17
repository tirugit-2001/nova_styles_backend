import express from "express";
import portfolioController from "../controllers/portfolio.controller";
import verifyAdmin from "../../../middlewares/verifyAdmin";
import verifyUser from "../../../middlewares/verifyUser";
import upload from "../../../middlewares/upload";

const router = express.Router();

// Public route - Get all portfolios
router.get("/portfolio", portfolioController.getPortfolios);

// Public route - Get single portfolio
router.get("/portfolio/:id", portfolioController.getPortfolioById);

// Admin routes - require authentication (verifyUser first, then verifyAdmin)
router.post("/portfolio", verifyUser, verifyAdmin, upload.single("image"), portfolioController.createPortfolio);
router.put("/portfolio/:id", verifyUser, verifyAdmin, upload.single("image"), portfolioController.updatePortfolio);
router.delete("/portfolio/:id", verifyUser, verifyAdmin, portfolioController.deletePortfolio);

// Sections
router.post("/portfolio/:id/sections", verifyUser, verifyAdmin, portfolioController.addSection);
router.post(
  "/portfolio/:id/sections/:sectionIndex/images",
  verifyUser,
  verifyAdmin,
  upload.array("images", 30),
  portfolioController.addSectionImages
);

export default router;

