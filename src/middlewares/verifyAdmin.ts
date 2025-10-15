import { Request, Response, NextFunction } from "express";

import Apperror from "../utils/apperror";

const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // First ensure token is verified
    const user = (req as any).user;

    if (!user) {
      return next(new Apperror("Unauthorized: No user found", 401));
    }

    if (user.role !== "admin") {
      return next(new Apperror("Access denied: Admins only", 403));
    }

    next();
  } catch (err) {
    next(new Apperror("Admin verification failed", 401));
  }
};
export default verifyAdmin;
