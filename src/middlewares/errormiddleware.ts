import { NextFunction, Request, Response } from "express";
import Apperror from "../utils/apperror";
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  // Log the error for debugging - handle cases where error might not have standard properties
  console.error("Error occurred:", {
    message: err?.message,
    stack: err?.stack,
    name: err?.name,
    statusCode: err?.statusCode,
    path: req.path,
    method: req.method,
    errorType: err?.constructor?.name,
    fullError: err,
  });

  if (err instanceof Apperror) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "An error occurred",
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

  // Handle Razorpay errors (they have a nested error structure)
  if (err && typeof err === 'object' && 'error' in err && err.error && typeof err.error === 'object') {
    const razorpayError = err as any;
    const errorMessage = razorpayError.error?.description || razorpayError.error?.message || "Payment processing failed";
    
    // Map Razorpay error codes to HTTP status codes (ensure it's always a number)
    let httpStatusCode = 400; // default
    if (razorpayError?.statusCode && typeof razorpayError.statusCode === 'number') {
      httpStatusCode = razorpayError.statusCode;
    } else if (razorpayError?.error?.code) {
      const razorpayCode = razorpayError.error.code;
      if (razorpayCode === 'BAD_REQUEST_ERROR' || razorpayCode === 'AUTHENTICATION_ERROR') {
        httpStatusCode = 401;
      } else if (razorpayCode === 'GATEWAY_ERROR' || razorpayCode === 'SERVER_ERROR') {
        httpStatusCode = 500;
      } else if (razorpayCode === 'NOT_FOUND_ERROR') {
        httpStatusCode = 404;
      }
    }
    
    return res.status(httpStatusCode).json({
      success: false,
      message: errorMessage,
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
  const errorMessage = err?.message || err?.toString() || "Something went wrong";
  return res.status(err?.statusCode || 500).json({
    success: false,
    message: errorMessage,
    ...(isDevelopment && { 
      error: errorMessage, 
      stack: err?.stack,
      errorDetails: err 
    }),
  });
};

export default errorHandler;
