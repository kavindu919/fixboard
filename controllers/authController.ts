import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "../lib/schema/userSchema";
import { ZodError } from "zod";

export const userRegistration = async (req: Request, res: Response) => {
  try {
    const validData = registerSchema.parse(req.body);

    const isRegisterd = await prisma.user.findUnique({
      where: {
        email: validData.email,
      },
    });
    if (isRegisterd) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashPassword = await bcrypt.hash(validData.password, 12);
    const newUser = await prisma.user.create({
      data: {
        name: validData.name,
        email: validData.email,
        password: hashPassword,
        role: "user",
      },
    });

    if (newUser) {
      const token = jwt.sign(
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "2d" },
      );

      return res.status(201).json({
        success: true,
        data: {
          token,
          name: newUser.name,
          email: newUser.email,
        },
        message: "User registered successfully",
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0]?.message,
      });
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const validData = loginSchema.parse(req.body);

    const isUser = await prisma.user.findUnique({
      where: {
        email: validData.email,
      },
    });
    if (!isUser) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      validData.password,
      isUser.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const token = jwt.sign(
      {
        id: isUser.id,
        name: isUser.name,
        email: isUser.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "2d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "User login successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const userLogout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkAuthentication = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
