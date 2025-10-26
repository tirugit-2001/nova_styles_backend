import { Request, Response, NextFunction } from "express";
import userService from "../service/user.service";
import config from "../../../config/config";
import Apperror from "../../../utils/apperror";

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

// const login = async (req: Request, res: Response): Promise<any> => {
//   const { email, password, deviceId } = req.body;
//   const user = await User.findOne({ email });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const { accessToken, refreshToken } = generateToken({
//     userId: user._id as string,
//     deviceId: deviceId,
//     username: user.username,
//     email: user.email,
//   });

//   const result = await Sessionmodel.updateOne(
//     { userId: user._id, deviceId }, // Find by user and device
//     { $set: { refreshToken, createdAt: new Date() } }, // Update refresh token
//     { upsert: true } // If not found, insert new document
//   );

//   console.log(result);
//   res.json({ accessToken, refreshToken, user });
//   try {
//   } catch (e) {
//     console.log(e);
//     return res.status(401).send({
//       message: "Something went wrong",
//       success: "false",
//       e,
//     });
//   }
// };
/******************refresh***************** */
const refreshRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { refreshToken: payloadRefresh } = req.body;
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
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "strict",
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
    const { deviceId } = req.body;
    const id = req.params.id;
    console.log(deviceId);
    const result = await userService.logoutFromDevice(id, deviceId);
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
    const userId = req.params.id;
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
export {
  register,
  login,
  refreshRefreshToken,
  logoutFromDevice,
  logoutAllDevices,
};
