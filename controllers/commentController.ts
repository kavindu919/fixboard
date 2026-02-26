import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { commentSchema } from "../lib/schema/commentSchema";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { comment, issueId } = req.body;
    const userId = req.user?.id;
    if (!userId || !comment || !issueId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const validateData = commentSchema.parse({
      text: comment,
      issueId: issueId,
    });
    await prisma.comment.create({
      data: {
        text: validateData.text,
        createdById: userId,
        issueId: validateData.issueId,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "Comment added successfull" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    if (!userId || !id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const comments = await prisma.comment.findMany({
      where: { issueId: id },
      select: {
        text: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });
    const formattedComments = comments.map((item) => ({
      text: item.text,
      created: item.createdBy.name,
    }));
    return res.status(200).json({
      success: true,
      message: "Data retrived successfull",
      data: formattedComments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
