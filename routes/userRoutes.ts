import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { deleteUser, getAllUserData } from "../controllers/userController";

const userRoute = express.Router();

userRoute.get("/get-allusers", authMiddleware, getAllUserData);
userRoute.post("/delete-user", authMiddleware, deleteUser);

export default userRoute;
