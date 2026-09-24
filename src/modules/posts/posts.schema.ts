import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;