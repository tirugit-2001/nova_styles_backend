import express from "express";
import {
  checkSession,
  login,
  logoutAllDevices,
  logoutFromDevice,
  register,
} from "../controllers/user.controller";
import { refreshRefreshToken } from "../controllers/user.controller";
import verifyUser from "../../../middlewares/verifyUser";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", verifyUser, logoutFromDevice);
router.post("/logout-all/", verifyUser, logoutAllDevices);
router.post("/refresh-token", refreshRefreshToken);
router.get("/check-session", verifyUser, checkSession);

export default router;
