import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/utiltoken";
import Apperror from "../utils/apperror";
import userRepository from "../modules/auth/repository/user.repository";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from cookies or Authorization header
    let accessToken = req.cookies?.accessToken;
    
    if (!accessToken && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      } else {
        accessToken = authHeader; // Fallback: use entire header if no Bearer prefix
      }
    }

    console.log("accesstoken");
    console.log(accessToken);
    if (!accessToken) {
      throw new Apperror("Access token is missing. Please log in.", 401);
    }

    // 1️⃣ Verify and decode JWT
    let decoded: any;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (jwtError: any) {
      // Handle JWT-specific errors
      if (jwtError instanceof TokenExpiredError) {
        throw new Apperror("Access token has expired. Please log in again.", 401);
      }
      if (jwtError instanceof JsonWebTokenError) {
        throw new Apperror("Invalid access token. Please log in again.", 401);
      }
      // Re-throw if it's not a known JWT error
      throw new Apperror("Token verification failed. Please log in again.", 401);
    }

    console.log(decoded);
    console.log("decoded");
    if (!decoded || !decoded._id || !decoded.deviceId) {
      throw new Apperror("Invalid or expired access token.", 401);
    }

    // 2️⃣ Check if session exists in DB
    let session;
    try {
      console.log("Checking session for userId:", decoded._id, "deviceId:", decoded.deviceId);
      session = await userRepository.findSession(
        decoded._id,
        decoded.deviceId
      );
      console.log("Session lookup result:", session ? "Session found" : "Session not found");
    } catch (dbError: any) {
      // Handle database errors
      const errorMessage = dbError?.message || "Database error while checking session";
      console.error("Database error in session lookup:", errorMessage, dbError);
      throw new Apperror("Session verification failed. Please log in again.", 401);
    }
    
    if (!session) {
      console.log("No session found for user:", decoded._id, "deviceId:", decoded.deviceId);
      throw new Apperror(
        "Session expired or logged out. Please log in again.",
        401
      );
    }

    // 3️⃣ Attach user to request object
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    // If error is already an Apperror, pass it through
    if (error instanceof Apperror) {
      console.error("Auth verification failed:", error.message);
      return next(error);
    }
    // Convert unknown errors to Apperror
    const errorMessage = error?.message || error?.toString() || "Authentication failed. Please log in again.";
    console.error("Auth verification failed:", errorMessage, error);
    next(new Apperror(errorMessage, 401));
  }
};

export default verifyUser;
