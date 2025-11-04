import express from "express";
import usersControllers from "../controllers/users.controllers";
import verifyUser from "../../../middlewares/verifyUser";
const router = express.Router();
router.use(verifyUser);
router.get("/address", verifyUser, usersControllers.getUserAddressById);
router.get("/orders", verifyUser, usersControllers.getUserOrdersById);

export default router;
