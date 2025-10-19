import express from "express";
import * as HeroController  from "../controllers/hero.controller"

const router = express.Router();


router.post("/hero",HeroController.createHeroContent);
router.get("/hero",HeroController.getHeroes);
router.put("/hero/:id", HeroController.updateHero);
router.delete("/hero/:id", HeroController.deleteHero)



export default router;