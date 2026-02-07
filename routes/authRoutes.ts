import express from "express";
import { userLogin, userRegistration } from "../controllers/authController";

const authRoute = express.Router();

authRoute.post("/register", userRegistration);
authRoute.post("/login", userLogin);

export default authRoute;
