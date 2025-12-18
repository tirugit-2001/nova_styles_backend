import { Request, Response, NextFunction } from "express";
import estimationService from "../service/estimation.service";
import InteriorEstimation from "../../../models/InteriorEstimation.schema";
import ConstructionEstimation from "../../../models/ConstructionEstimation.schema";
import path from "path";
import fs from "fs";

// Helper function to delete attachment files
const deleteAttachmentFile = async (filePath: string | undefined) => {
  if (!filePath) return;
  
  try {
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      console.log(`✅ Deleted attachment file: ${fullPath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting attachment file: ${error}`);
    // Don't throw - file deletion failure shouldn't prevent DB deletion
  }
};

const getInteriorEstimations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      interiorType: req.query.interiorType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      search: req.query.search as string,
      sort: (req.query.sort as string) || "-createdAt",
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      skip: req.query.page
        ? (parseInt(req.query.page as string) - 1) *
          (parseInt(req.query.limit as string) || 10)
        : 0,
    };

    const result = await estimationService.getAllInteriorEstimations(filters);

    res.status(200).json({
      success: true,
      message: "Interior estimations fetched successfully",
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getConstructionEstimations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      buildingType: req.query.buildingType as string,
      projectType: req.query.projectType as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      search: req.query.search as string,
      sort: (req.query.sort as string) || "-createdAt",
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      skip: req.query.page
        ? (parseInt(req.query.page as string) - 1) *
          (parseInt(req.query.limit as string) || 10)
        : 0,
    };

    const result = await estimationService.getAllConstructionEstimations(filters);

    res.status(200).json({
      success: true,
      message: "Construction estimations fetched successfully",
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getInteriorEstimationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const estimation = await estimationService.getInteriorEstimationById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Interior estimation fetched successfully",
      data: estimation,
    });
  } catch (err) {
    next(err);
  }
};

const getConstructionEstimationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const estimation = await estimationService.getConstructionEstimationById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Construction estimation fetched successfully",
      data: estimation,
    });
  } catch (err) {
    next(err);
  }
};

const getEstimationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await estimationService.getEstimationStats();

    res.status(200).json({
      success: true,
      message: "Estimation statistics fetched successfully",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

const downloadInteriorAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const estimation = await InteriorEstimation.findById(req.params.id);

    if (!estimation) {
      return res.status(404).json({
        success: false,
        message: "Interior estimation not found",
      });
    }

    if (!estimation.hasAttachment || !estimation.attachmentFilePath) {
      return res.status(404).json({
        success: false,
        message: "No attachment found for this estimation",
      });
    }

    // Normalize the path - handle both absolute and relative paths
    let filePath = estimation.attachmentFilePath;
    
    // If path is relative, make it absolute relative to project root
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Attachment file not found on server",
      });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${estimation.attachmentFilename || "attachment.pdf"}"`
    );

    // Send PDF file
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

const downloadConstructionAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const estimation = await ConstructionEstimation.findById(req.params.id);

    if (!estimation) {
      return res.status(404).json({
        success: false,
        message: "Construction estimation not found",
      });
    }

    if (!estimation.hasAttachment || !estimation.attachmentFilePath) {
      return res.status(404).json({
        success: false,
        message: "No attachment found for this estimation",
      });
    }

    // Normalize the path - handle both absolute and relative paths
    let filePath = estimation.attachmentFilePath;
    
    // If path is relative, make it absolute relative to project root
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Attachment file not found on server",
      });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${estimation.attachmentFilename || "attachment.pdf"}"`
    );

    // Send PDF file
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};

const deleteInteriorEstimation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get estimation first to check for attachment file
    const estimation = await InteriorEstimation.findById(req.params.id);
    
    if (!estimation) {
      return res.status(404).json({
        success: false,
        message: "Interior estimation not found",
      });
    }

    // Delete attachment file if exists
    if (estimation.attachmentFilePath) {
      await deleteAttachmentFile(estimation.attachmentFilePath);
    }

    // Delete from database
    const deleted = await estimationService.deleteInteriorEstimation(req.params.id);

    res.status(200).json({
      success: true,
      message: "Interior estimation deleted successfully",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

const deleteConstructionEstimation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get estimation first to check for attachment file
    const estimation = await ConstructionEstimation.findById(req.params.id);
    
    if (!estimation) {
      return res.status(404).json({
        success: false,
        message: "Construction estimation not found",
      });
    }

    // Delete attachment file if exists
    if (estimation.attachmentFilePath) {
      await deleteAttachmentFile(estimation.attachmentFilePath);
    }

    // Delete from database
    const deleted = await estimationService.deleteConstructionEstimation(req.params.id);

    res.status(200).json({
      success: true,
      message: "Construction estimation deleted successfully",
      data: deleted,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getInteriorEstimations,
  getConstructionEstimations,
  getInteriorEstimationById,
  getConstructionEstimationById,
  getEstimationStats,
  downloadInteriorAttachment,
  downloadConstructionAttachment,
  deleteInteriorEstimation,
  deleteConstructionEstimation,
};

