import Content from "../../../models/content.schema";

const createSection = async (data: any) => {
  return await Content.create(data);
};
const findSection = async (section: string) => {
  return await Content.find({ section }).sort({ order: 1 }).limit(4);
};
const findById = async (id: string) => {
  return await Content.findById(id);
};
const updateContent = async (id: string, data: any) => {
  return await Content.findByIdAndUpdate(id, data, { new: true });
};

const deleteContent = async (id: string) => {
  await Content.findByIdAndDelete(id);
  return true;
};

export default {
  createSection,
  findSection,
  deleteContent,
  updateContent,
  findById,
};
