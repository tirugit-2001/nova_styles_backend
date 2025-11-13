import express from "express";
import {
  checkSession,
  login,
  logoutAllDevices,
  logoutFromDevice,
  logout,
  register,
  createAdmin,
  changePassword,
} from "../controllers/user.controller";
import { refreshRefreshToken } from "../controllers/user.controller";
import verifyUser from "../../../middlewares/verifyUser";
import verifyAdmin from "../../../middlewares/verifyAdmin";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

// Logout - clears cookies
router.post("/logout", verifyUser, logout);
router.post("/logout-all/", verifyUser, logoutAllDevices);
router.post("/refresh-token", refreshRefreshToken);
router.get("/check-session", verifyUser, checkSession);

// Admin routes
router.post("/create-admin", verifyUser, verifyAdmin, createAdmin);

// User routes
router.put("/change-password", verifyUser, changePassword);

export default router;
