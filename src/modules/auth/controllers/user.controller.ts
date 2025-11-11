import { Request, Response, NextFunction } from "express";
import userService from "../service/user.service";
import config from "../../../config/config";
import Apperror from "../../../utils/apperror";
import user from "../../../models/user.schema";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { name: username, email, password, phone } = req.body;
    console.log(username);
    if (!username || !email || !password || !phone) {
      return res.status(400).send("All fields are required");
    }
    const data = await userService.createUser(username, email, password, phone);
    return res.status(201).send({
      message: "User created successfully",
      newUser: {
        email: data.email,
        phone: data.phone,
        username: data.username,
      },
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, password, deviceId } = req.body;
    console.log(req.body);
    if (!email || !password || !deviceId) {
      res.status(400).send("All fields are required");
    }

    const result = await userService.loginUser(email, password, deviceId);
    return res
      .cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .status(200)
      .send({ message: "User logged successfully", result });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

/******************refresh***************** */
const refreshRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { refreshToken: payloadRefresh } = req.cookies;
    console.log(req.cookies);
    console.log("refreshToken ", payloadRefresh);
    if (!payloadRefresh) {
      throw new Apperror("No token provided", 401);
    }

    const { accessToken, refreshToken } = await userService.refreshRefreshToken(
      payloadRefresh
    );
    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .send({ message: "Refresh token fetched successfully" });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
/******************logout from particular device***************** */
const logoutFromDevice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const data = req?.user;
    console.log("data");
    console.log(data);
    if (!data?._id || !data.deviceId) {
      throw new Apperror("User credentials not found", 404);
    }
    const result = await userService.logoutFromDevice(
      data?._id,
      data?.deviceId
    );
    console.log(result);
    return res
      .status(200)
      .json({ message: "Logged out from this device", result });
  } catch (err: any) {
    next(err);
  }
};
/******************logout from all device***************** */
const logoutAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req?.user?._id;
    if (!userId) {
      throw new Apperror("no user Id found", 404);
    }
    console.log(userId);
    const data = await userService.logoutAllDevices(userId);
    return res.status(200).send({
      message: "Logged out from all devices",
      data,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const checkSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.email) {
      throw new Apperror("No session found", 404);
    }
    const userData = await userService.checkSession(req?.user?.email);
    return res.status(200).send({
      message: "Session found",
      user_info: {
        email: userData.email,
        username: userData.username,
        phone: userData.phone,
      },
    });
  } catch (e) {
    next(e);
  }
};
export {
  register,
  login,
  refreshRefreshToken,
  logoutFromDevice,
  logoutAllDevices,
  checkSession,
};
