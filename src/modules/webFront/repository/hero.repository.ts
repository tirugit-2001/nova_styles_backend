// repository/hero.repository.ts
import Hero, { IHero } from "../../../models/hero.schema";

export const createHero = async (data: Partial<IHero>) => {
  const hero = new Hero(data);
  return await hero.save();
};

export const getAllHeros = async () => {
  return await Hero.find();
};

export const getHeroById = async (id: string) => {
  return await Hero.findById(id);
};

export const deleteHero = async (id: string) => {
  return await Hero.findByIdAndDelete(id);
};

export const updateHero = async (id: string, data: Partial<IHero>) => {
  return await Hero.findByIdAndUpdate(id, data, { new: true });
};