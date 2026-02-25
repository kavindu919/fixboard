import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createComment, getComments } from "../controllers/commentController";

const commentRoute = express.Router();

commentRoute.post("/create-comment", authMiddleware, createComment);
commentRoute.get("/get-comments/:id", authMiddleware, getComments);

export default commentRoute;
