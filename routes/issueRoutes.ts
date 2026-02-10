import express from "express";
import {
  assignIssue,
  createIssue,
  deleteIssue,
  getAllIssues,
  getAllUsers,
  updateIssue,
  updateIssueStatus,
} from "../controllers/issueController";
import { authMiddleware } from "../middleware/authMiddleware";

const issueRoute = express.Router();

issueRoute.post("/create-issue", authMiddleware, createIssue);
issueRoute.post("/update-issue", authMiddleware, updateIssue);
issueRoute.post("/update-issue-status", authMiddleware, updateIssueStatus);
issueRoute.delete("/delete-issue", authMiddleware, deleteIssue);
issueRoute.post("/assign-issue", authMiddleware, assignIssue);
issueRoute.get("/all-users", authMiddleware, getAllUsers);
issueRoute.get("/all-issues", authMiddleware, getAllIssues);

export default issueRoute;
