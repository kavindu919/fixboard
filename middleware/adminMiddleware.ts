import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "Missing auth headers",
      });
    }

    const [type, authToken] = req.headers.authorization.split(" ");

    if (!authToken || type !== "Bearer") {
      return res.status(403).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(authToken, jwtSecret) as JwtPayload;

    const isAdmin = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        role: true,
      },
    });
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }
    if (isAdmin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
      });
    }
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        success: false,
        message: "Token has expired",
      });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
