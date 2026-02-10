import * as z from "zod";

export const issueSchema = z.object({
  title: z.string({
    message: "Title is required",
  }),
  description: z.string({
    message: "Description is required",
  }),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  severity: z.enum(["minor", "major", "critical"]).optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.preprocess((val) => {
    if (!val) return null;
    const date = new Date(val as string);
    return isNaN(date.getTime()) ? null : date;
  }, z.date().nullable()),
  estimatedHours: z
    .number({
      message: "Estimated hours must be a number",
    })
    .int()
    .positive()
    .optional(),
  actualHours: z
    .number({
      message: "Actual hours must be a number",
    })
    .int()
    .positive()
    .optional(),
  attachments: z
    .array(
      z.object({
        name: z.string({ message: "Attachment name is required" }),
        url: z.string().url({ message: "Attachment URL must be valid" }),
        uploadedAt: z
          .string()
          .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: "Invalid date format for uploadedAt",
          })
          .optional(),
      }),
    )
    .optional(),
});

export const updateissueSchema = z.object({
  id: z.string({
    message: "Issue id is required",
  }),
  title: z.string({
    message: "Title is required",
  }),
  description: z.string({
    message: "Description is required",
  }),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  severity: z.enum(["minor", "major", "critical"]).optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
  estimatedHours: z
    .number({
      message: "Estimated hours must be a number",
    })
    .int()
    .positive()
    .optional(),
  actualHours: z
    .number({
      message: "Actual hours must be a number",
    })
    .int()
    .positive()
    .optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().url(),
        filename: z.string(),
      }),
    )
    .optional(),
});

export const updateissuestatusSchema = z.object({
  id: z.string({
    message: "Issue id is required",
  }),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  resolvedAt: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  closedAt: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});
