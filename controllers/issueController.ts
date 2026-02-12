import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  issueSchema,
  updateissueSchema,
  updateissuestatusSchema,
} from "../lib/schema/issueSchema";
import { ZodError } from "zod";
import { priorityLabelMap, statusLabelMap } from "../lib/helpers/issueHelper";
import { Parser } from "json2csv";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const validateData = issueSchema.parse(req.body);
    const userId = req.user?.id;
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
        attachments: validateData.attachments
          ? {
              set: validateData.attachments.map((att) => ({
                name: att.name,
                url: att.url,
                uploadedAt: att.uploadedAt
                  ? new Date(att.uploadedAt)
                  : new Date(),
              })),
            }
          : [],
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

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const validData = updateissueSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field" });
    }

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
        actualHours: validData.actualHours ?? null,
        attachments: validData.attachments
          ? {
              set: validData.attachments.map((att) => ({
                name: att.name,
                url: att.url,
                uploadedAt: att.uploadedAt
                  ? new Date(att.uploadedAt)
                  : new Date(),
              })),
            }
          : [],
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

export const updateIssueStatus = async (req: Request, res: Response) => {
  try {
    const validData = updateissuestatusSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field" });
    }
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
  try {
    const id = req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid issue id",
      });
    }
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Missing required fields",
      });
    }
    const issue = await prisma.issue.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        severity: true,
        createdById: true,
        assignedToId: true,
        tags: true,
        dueDate: true,
        closedAt: true,
        resolvedAt: true,
        estimatedHours: true,
        actualHours: true,
        attachments: true,
      },
    });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: issue,
      message: "Data retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      priority,
      severity,
      assignedTo,
      createdBy,
      page = "1",
      limit = "20",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (severity) where.severity = severity;
    if (assignedTo) where.assignedToId = assignedTo;
    if (createdBy) where.createdById = createdBy;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const issues = await prisma.issue.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        severity: true,
        dueDate: true,
        assignedTo: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const formattedIsssue = issues.map((item) => ({
      ...item,
      status: statusLabelMap[item.status],
      priority: priorityLabelMap[item.priority],
      assignedToName: item.assignedTo?.name,
    }));

    const total = await prisma.issue.count({ where });

    return res.json({
      success: true,
      data: formattedIsssue,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const exportIssues = async (req: Request, res: Response) => {
  const { format = "csv" } = req.query as { format?: string };

  try {
    const {
      search,
      status,
      priority,
      severity,
      assignedTo,
      createdBy,
      page = "1",
      limit = "20",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (severity) where.severity = severity;
    if (assignedTo) where.assignedToId = assignedTo;
    if (createdBy) where.createdById = createdBy;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    const issues = await prisma.issue.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        severity: true,
        dueDate: true,
        assignedTo: { select: { name: true } },
        createdAt: true,
      },
    });
    const formattedIsssues = issues.map((item) => ({
      id: item.id,
      title: item.title,
      status: statusLabelMap[item.status],
      priority: priorityLabelMap[item.priority],
      severity: item.severity,
      assignedTo: item.assignedTo?.name || "",
      dueDate: item.dueDate ? item.dueDate.toISOString().split("T")[0] : "-",
      createdAt: item.createdAt
        ? item.createdAt.toISOString().split("T")[0]
        : "-",
    }));
    if (format === "json") {
      return res.status(200).json({
        success: true,
        message: "Issues export successfully",
        data: formattedIsssues,
      });
    }
    const praser = new Parser();
    const csv = praser.parse(formattedIsssues);
    res.header("Content-Type", "text/csv");
    return res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
