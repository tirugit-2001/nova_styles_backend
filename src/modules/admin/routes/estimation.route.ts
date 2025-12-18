import express from "express";
import estimationController from "../controllers/estimation.controller";
import verifyAdmin from "../../../middlewares/verifyAdmin";
import verifyUser from "../../../middlewares/verifyUser";

const router = express.Router();

// All routes require user authentication first, then admin verification
router.use(verifyUser);
router.use(verifyAdmin);

// Get statistics
router.get("/stats", estimationController.getEstimationStats);

// Get all interior estimations
router.get("/interior", estimationController.getInteriorEstimations);

// Get all construction estimations
router.get("/construction", estimationController.getConstructionEstimations);

// Download interior estimation attachment (must come before /:id route)
router.get("/interior/:id/attachment", estimationController.downloadInteriorAttachment);

// Download construction estimation attachment (must come before /:id route)
router.get("/construction/:id/attachment", estimationController.downloadConstructionAttachment);

// Get single interior estimation by ID
router.get("/interior/:id", estimationController.getInteriorEstimationById);

// Get single construction estimation by ID
router.get("/construction/:id", estimationController.getConstructionEstimationById);

// Delete interior estimation
router.delete("/interior/:id", estimationController.deleteInteriorEstimation);

// Delete construction estimation
router.delete("/construction/:id", estimationController.deleteConstructionEstimation);

export default router;

