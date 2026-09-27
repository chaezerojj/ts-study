import z from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1),
  // * parentId 
  // - optional
  // - 대댓글일때만 넘어옴
  // - 최상위 댓글은 parentId 없이 요청
  parentId: z.number().int().positive().optional(),
});


export type CreateCommentInput = z.infer<typeof createCommentSchema>;