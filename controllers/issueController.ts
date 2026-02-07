import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  issueSchema,
  updateissueSchema,
  updateissuestatusSchema,
} from "../lib/schema/issueSchema";
import { success } from "zod";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const validateData = issueSchema.parse(req.body);
    const userId = req.body.user.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required feild" });
    }
    const newIssue = await prisma.issue.create({
      data: {
        title: validateData.title,
        description: validateData.description,
        status: validateData.status || "open",
        priority: validateData.priority || "medium",
        severity: validateData.severity || "minor",
        createdById: userId,
        assignedToId: validateData.assignedToId ?? null,
        tags: validateData.tags || [],
        dueDate: validateData.dueDate ?? null,
        estimatedHours: validateData.estimatedHours ?? null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    await prisma.activity.create({
      data: {
        issueId: newIssue.id,
        userId: userId,
        action: "created",
        comment: "Issue created",
      },
    });
    return res.status(201).json({
      success: true,
      data: {
        id: newIssue.id,
        title: newIssue.title,
        description: newIssue.description,
        status: newIssue.status,
        priority: newIssue.priority,
        severity: newIssue.severity,
        tags: newIssue.tags,
        dueDate: newIssue.dueDate,
        estimatedHours: newIssue.estimatedHours,
        createdBy: newIssue.createdBy,
        assignedTo: newIssue.assignedTo,
      },
      message: "Issue created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const validData = updateissueSchema.parse(req.body);
    const userId = req.body.user.id;
    const existingIssue = await prisma.issue.findUnique({
      where: { id: validData.id },
    });
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    const updatedIssue = await prisma.issue.update({
      where: { id: validData.id },
      data: {
        title: validData.title,
        description: validData.description,
        status: validData.status || "open",
        priority: validData.priority || "medium",
        severity: validData.severity || "minor",
        createdById: userId,
        assignedToId: validData.assignedToId ?? null,
        tags: validData.tags || [],
        dueDate: validData.dueDate ?? null,
        estimatedHours: validData.estimatedHours ?? null,
      },
    });
    await prisma.activity.create({
      data: {
        issueId: updatedIssue.id,
        userId: userId,
        action: "updated",
        comment: "Issue updated",
      },
    });
    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateIssueStatus = async (req: Request, res: Response) => {
  try {
    const validData = updateissuestatusSchema.parse(req.body);
    const userId = req.body.user.id;
    const existingIssue = await prisma.issue.findUnique({
      where: { id: validData.id },
    });
    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    const updatedIssue = await prisma.issue.update({
      where: { id: validData.id },
      data: {
        status: validData.status!,
        resolvedAt: validData.status === "resolved" ? new Date() : null,
        closedAt: validData.status === "closed" ? new Date() : null,
      },
    });
    await prisma.activity.create({
      data: {
        issueId: updatedIssue.id,
        userId: userId,
        action: "status_changed",
        comment: `Status changed to ${validData.status}`,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const issueId = req.body.id;
    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: "Issue id is required",
      });
    }
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    await prisma.activity.deleteMany({
      where: { issueId: issueId },
    });
    await prisma.issue.delete({
      where: { id: issueId },
    });
    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const assignIssue = async (req: Request, res: Response) => {
  try {
    const { assigneeId, issueId } = req.body;
    const userId = req.body.user.id;
    if (!assigneeId || !issueId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    const updateIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        assignedToId: assigneeId,
      },
    });
    await prisma.activity.create({
      data: {
        issueId: updateIssue.id,
        userId: userId,
        action: "assigned",
        comment: "Issue assigned",
      },
    });
    return res.status(200).json({
      success: true,
      message: "Issue assignment updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }
  const issue = await prisma.issue.findUnique({
    where: { id },
    select: {
      id: true,
    },
  });
};
