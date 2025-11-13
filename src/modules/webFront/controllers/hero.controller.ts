// controllers/hero.controller.ts
import { Request, Response } from "express";
import * as heroService from "../services/hero.service";

export const createHeroContent = async (req: Request, res: Response) => {
  try {
    const hero = await heroService.createHero(req.body);
    res.status(201).json({ success: true, hero, message: "Hero created successfully" });
  } catch (err: any) {
    console.error("Create hero error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHeroes = async (req: Request, res: Response) => {
  try {
    const heroes = await heroService.getHero();
    res.status(200).json({ success: true, heroes });
  } catch (err: any) {
    console.error("Get heroes error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateHero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await heroService.updateHero(id, req.body);
    res.status(200).json({ success: true, updated, message: "Hero updated successfully" });
  } catch (err: any) {
    console.error("Update hero error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await heroService.deleteHero(id);
    res.status(200).json({ success: true, message: "Hero deleted successfully" });
  } catch (err: any) {
    console.error("Delete hero error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};