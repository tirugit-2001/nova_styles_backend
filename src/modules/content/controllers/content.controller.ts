import { Request, Response, NextFunction } from "express";
import contentService from "../service/content.service";

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

const postContactForm = () => {};
export default {
  createContent,
  getContentBySection,
  updateContent,
  deleteContent,
  getContentById,
  postContactForm,
};
