import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/utiltoken";
import Apperror from "../utils/apperror";
import userRepository from "../modules/auth/repository/user.repository";

const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    console.log("accesstoken");
    console.log(accessToken);
    if (!accessToken) {
      throw new Apperror("Access token is missing. Please log in.", 401);
    }

    // 1️⃣ Verify and decode JWT
    const decoded: any = verifyAccessToken(accessToken);
    console.log(decoded);
    console.log("decoded");
    if (!decoded || !decoded._id || !decoded.deviceId) {
      throw new Apperror("Invalid or expired access token.", 403);
    }

    // 2️⃣ Check if session exists in DB
    const session = await userRepository.findSession(
      decoded._id,
      decoded.deviceId
    );
    if (!session) {
      throw new Apperror(
        "Session expired or logged out. Please log in again.",
        401
      );
    }

    // 3️⃣ Attach user to request object
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.error("Auth verification failed:", error.message);
    next(error);
  }
};

export default verifyUser;
