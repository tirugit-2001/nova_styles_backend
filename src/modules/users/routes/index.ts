import express from "express";
import usersControllers from "../controllers/users.controllers";
import verifyUser from "../../../middlewares/verifyUser";
const router = express.Router();
router.use("/address", verifyUser, usersControllers.getAddress);
export default router;
