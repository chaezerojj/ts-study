import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createCommentSchema } from "./comments.schema";
import * as commentsService from "./comments.service";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const comments = await commentsService.getCommentsByPostId(postId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.flatten() });
      return;
    }
    const comment = await commentsService.createCommment(postId, req.user!.id, parsed.data);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

router.delete("/:commentId", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.commentId);
    await commentsService.deleteComment(id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;