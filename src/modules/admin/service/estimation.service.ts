import estimationRepository from "../repository/estimation.repository";
import Apperror from "../../../utils/apperror";

const getAllInteriorEstimations = async (filters: any = {}) => {
  return await estimationRepository.getAllInteriorEstimations(filters);
};

const getAllConstructionEstimations = async (filters: any = {}) => {
  return await estimationRepository.getAllConstructionEstimations(filters);
};

const getInteriorEstimationById = async (id: string) => {
  const estimation = await estimationRepository.getInteriorEstimationById(id);
  if (!estimation) {
    throw new Apperror("Interior estimation not found", 404);
  }
  return estimation;
};

const getConstructionEstimationById = async (id: string) => {
  const estimation = await estimationRepository.getConstructionEstimationById(id);
  if (!estimation) {
    throw new Apperror("Construction estimation not found", 404);
  }
  return estimation;
};

const getEstimationStats = async () => {
  return await estimationRepository.getEstimationStats();
};

const deleteInteriorEstimation = async (id: string) => {
  const deleted = await estimationRepository.deleteInteriorEstimation(id);
  if (!deleted) {
    throw new Apperror("Interior estimation not found", 404);
  }
  return deleted;
};

const deleteConstructionEstimation = async (id: string) => {
  const deleted = await estimationRepository.deleteConstructionEstimation(id);
  if (!deleted) {
    throw new Apperror("Construction estimation not found", 404);
  }
  return deleted;
};

export default {
  getAllInteriorEstimations,
  getAllConstructionEstimations,
  getInteriorEstimationById,
  getConstructionEstimationById,
  getEstimationStats,
  deleteInteriorEstimation,
  deleteConstructionEstimation,
};

