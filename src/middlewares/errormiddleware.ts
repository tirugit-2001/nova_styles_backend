import { NextFunction, Request, Response } from "express";
import Apperror from "../utils/apperror";
export const errorHandler = (
  err: Apperror | Error,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  if (err instanceof Apperror) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Log the actual error for debugging
  console.error("Unhandled error:", err);
  console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace");

  // default for unhandled errors
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    ...(process.env.NODE_ENV === "development" && {
      error: err instanceof Error ? err.message : String(err),
    }),
  });
};

export default errorHandler;
