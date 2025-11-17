import { Request, Response, NextFunction } from "express";
import portfolioService from "../service/portfolio.service";

const getPortfolios = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const portfolios = await portfolioService.getAllPortfoliosWithFilter(req.query);
    res.status(200).json({
      success: true,
      portfolios,
      message: "Portfolios fetched successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getPortfolioById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const portfolio = await portfolioService.getPortfolioById(req.params.id);
    res.status(200).json({
      success: true,
      portfolio,
      message: "Portfolio fetched successfully",
    });
  } catch (err) {
    next(err);
  }
};

const createPortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const portfolio = await portfolioService.createPortfolio(req.body, req.file as Express.Multer.File | undefined);
    res.status(201).json({
      success: true,
      portfolio,
      message: "Portfolio created successfully",
    });
  } catch (err) {
    next(err);
  }
};

const updatePortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const portfolio = await portfolioService.updatePortfolio(
      req.params.id,
      req.body,
      req.file as Express.Multer.File | undefined
    );
    res.status(200).json({
      success: true,
      portfolio,
      message: "Portfolio updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

const deletePortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await portfolioService.deletePortfolio(req.params.id);
    res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

const addSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const portfolio = await portfolioService.addSection(
      req.params.id,
      req.body.name
    );
    res.status(200).json({
      success: true,
      portfolio,
      message: "Section added successfully",
    });
  } catch (err) {
    next(err);
  }
};

const addSectionImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const portfolio = await portfolioService.addSectionImages(
      req.params.id,
      Number(req.params.sectionIndex),
      (req.files as Express.Multer.File[]) || []
    );
    res.status(200).json({
      success: true,
      portfolio,
      message: "Images added to section successfully",
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addSection,
  addSectionImages,
};

