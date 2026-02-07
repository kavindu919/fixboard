import express from "express";
import {
  assignIssue,
  createIssue,
  deleteIssue,
  updateIssue,
  updateIssueStatus,
} from "../controllers/issueController";

const issueRoute = express.Router();

issueRoute.post("/create-issue", createIssue);
issueRoute.post("/update-issue", updateIssue);
issueRoute.post("/update-issue-status", updateIssueStatus);
issueRoute.delete("/delete-issue", deleteIssue);
issueRoute.post("/assign-issue", assignIssue);

export default issueRoute;
