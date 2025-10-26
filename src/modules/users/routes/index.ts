import express from "express";
import usersControllers from "../controllers/users.controllers";
const router = express.Router();
router.use("/address", usersControllers.getAddress);
export default router;
