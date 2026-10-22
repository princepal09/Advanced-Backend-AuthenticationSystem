import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/common/error/AppError.js";
import { verifyAccessToken } from "../utils/auth/jwt.js";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new AppError("Authentication required", 401));
    }

    if (!authHeader.startsWith("Bearer ")) {
      return next(new AppError("Invalid Authentication Format", 401));
    }

    const accessToken = authHeader.split("")[1];
    if (!accessToken) {
      return next(new AppError("Access Token missing", 401));
    }

    const payload = verifyAccessToken(accessToken) as JwtPayload;

    req.user = {
      userId: payload.sub!,
      sessionId: payload.sessionId!,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Access token expired", 401));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid access token", 401));
    }

    return next(error);
  }
};
