import Portfolio from "../../../models/portfolio.schema";
import Apperror from "../../../utils/apperror";

const createPortfolio = async (data: any) => {
  return await Portfolio.create(data);
};

const getAllPortfolios = async (filter: any = {}) => {
  return await Portfolio.find(filter).sort({ createdAt: -1 });
};

const getPortfolioById = async (id: string) => {
  const portfolio = await Portfolio.findById(id);
  if (!portfolio) {
    throw new Apperror("Portfolio not found", 404);
  }
  return portfolio;
};

const updatePortfolio = async (id: string, data: any) => {
  const portfolio = await Portfolio.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!portfolio) {
    throw new Apperror("Portfolio not found", 404);
  }
  return portfolio;
};

const deletePortfolio = async (id: string) => {
  const portfolio = await Portfolio.findByIdAndDelete(id);
  if (!portfolio) {
    throw new Apperror("Portfolio not found", 404);
  }
  return portfolio;
};

export default {
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
};
 
