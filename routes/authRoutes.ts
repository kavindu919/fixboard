import express from "express";
import {
  checkAuthentication,
  userLogin,
  userLogout,
  userRegistration,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const authRoute = express.Router();

authRoute.post("/register", userRegistration);
authRoute.post("/login", userLogin);
authRoute.post("/logout", authMiddleware, userLogout);
authRoute.get("/me", authMiddleware, checkAuthentication);

export default authRoute;
