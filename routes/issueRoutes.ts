import express from "express";
import {
  assignIssue,
  createIssue,
  deleteIssue,
  getAllIssues,
  getAllUsers,
  getIssue,
  updateIssue,
  updateIssueStatus,
} from "../controllers/issueController";
import { authMiddleware } from "../middleware/authMiddleware";

const issueRoute = express.Router();

issueRoute.post("/create-issue", authMiddleware, createIssue);
issueRoute.post("/update-issue", authMiddleware, updateIssue);
issueRoute.post("/update-issue-status", authMiddleware, updateIssueStatus);
issueRoute.post("/delete-issue", authMiddleware, deleteIssue);
issueRoute.post("/assign-issue", authMiddleware, assignIssue);
issueRoute.get("/all-users", authMiddleware, getAllUsers);
issueRoute.get("/all-issues", authMiddleware, getAllIssues);
issueRoute.get("/get-issue/:id", authMiddleware, getIssue);
issueRoute.post("/update-issues", authMiddleware, updateIssue);
issueRoute.post("/update-issuess-status", authMiddleware, updateIssueStatus);

export default issueRoute;
