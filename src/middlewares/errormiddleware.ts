import { NextFunction, Request, Response } from "express";
import Apperror from "../utils/apperror";
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Log the error for debugging
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
  });

  if (err instanceof Apperror) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry. This record already exists.",
    });
  }

  // Handle Mongoose cast errors (invalid ID)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Handle payload too large errors (413)
  if (err.name === "PayloadTooLargeError" || err.statusCode === 413) {
    return res.status(413).json({
      success: false,
      message: "Request payload too large. Please reduce the image size or compress the image before uploading.",
    });
  }

  // default for unhandled errors - include error message in development
  const isDevelopment = process.env.NODE_ENV === "development";
  return res.status(err.statusCode || 500).json({
    success: false,
    message: "Something went wrong",
    ...(isDevelopment && { error: err.message, stack: err.stack }),
  });
};

export default errorHandler;
