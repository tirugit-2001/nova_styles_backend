import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/utiltoken";
import Apperror from "../utils/apperror";
const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const accessToken = req.cookies?.accessToken;
    console.log("Access Token:", accessToken);
    if (!accessToken) {
      throw new Apperror("Access token is missing. Please log in.", 401);
    }
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      throw new Apperror("Invalid or expired access token.", 403);
    }
    (req as any).user = decoded;
    console.log("Decoded User:", decoded);
    next();
  } catch (error: any) {
    console.error("Auth verification failed:", error.message);
    next(error);
  }
};

export default verifyUser;
