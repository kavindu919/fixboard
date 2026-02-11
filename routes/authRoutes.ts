import express from "express";
import {
  checkAuthentication,
  userLogin,
  userRegistration,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const authRoute = express.Router();

authRoute.post("/register", userRegistration);
authRoute.post("/login", userLogin);
authRoute.get("/me", authMiddleware, checkAuthentication);

export default authRoute;
