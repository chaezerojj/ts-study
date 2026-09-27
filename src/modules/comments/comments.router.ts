import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createCommentSchema } from "./comments.schema";
import * as commentsService from "./comments.service";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request, res: Response) => {
  try {
    const postId = Number(req.params.postId);
    const comments = await commentsService.getCommentsByPostId(postId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const postId = Number(req.params.postId);
    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.flatten() });
      return;
    }

    const comment = await commentsService.createCommment(
      postId,
      req.user!.id,
      parsed.data,
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete(
  "/:commentId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.commentId);
      await commentsService.deleteComment(id, req.user!.id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "NOT_FOUND") {
          res.status(404).json({ message: "Comment not found" });
          return;
        }
        if (err.message === "FORBIDDEN") {
          res.status(403).json({ message: "Forbidden" });
          return;
        }
      }
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
