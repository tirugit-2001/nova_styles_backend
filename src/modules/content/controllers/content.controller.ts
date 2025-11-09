import { Request, Response, NextFunction } from "express";
import contentService from "../service/content.service";
import { validate } from "../../../utils/validateschema";
import { interiorFormSchema } from "../../../utils/schemas/interiorFormSchema";
import { constructionFormSchema } from "../../../utils/schemas/constructionFormSchema";

const createContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const content = await contentService.createContent(req.body, req.file);
    res.status(201).json({ message: "Content created", content });
  } catch (err) {
    next(err);
  }
};

const getContentBySection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const content = await contentService.getContentBySection(
      req.params.section
    );
    res.status(200).json({ content });
  } catch (err) {
    next(err);
  }
};

const getContentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    res.status(200).json({ content });
  } catch (err) {
    next(err);
  }
};

const updateContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await contentService.updateContent(
      req.params.id,
      req.body,
      req.file
    );
    res.status(200).json({ message: "Content updated", updated });
  } catch (err) {
    next(err);
  }
};

const deleteContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await contentService.deleteContent(req.params.id);
    res.status(200).json({ message: "Content deleted" });
  } catch (err) {
    next(err);
  }
};

const postContactForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = validate(interiorFormSchema, req.body);

    // Send email notification to admin
    const job = await contentService.sendInteriorDesignNotification(
      validatedData
    );

    res.status(200).json({
      success: true,
      message: "Form submitted successfully. Our team will contact you shortly.",
      jobId: job?.id,
    });
  } catch (err) {
    next(err);
  }
};

const postConstructionForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const validatedData = validate(constructionFormSchema, req.body);

    // Send email notification to admin
    const job = await contentService.sendConstructionNotification(
      validatedData
    );

    res.status(200).json({
      success: true,
      message: "Form submitted successfully. Our team will contact you shortly.",
      jobId: job?.id,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createContent,
  getContentBySection,
  updateContent,
  deleteContent,
  getContentById,
  postContactForm,
  postConstructionForm,
};
