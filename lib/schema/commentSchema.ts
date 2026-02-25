import * as z from "zod";

export const commentSchema = z.object({
  text: z.string({
    message: "Comment is required",
  }),
  issueId: z.string(),
});
