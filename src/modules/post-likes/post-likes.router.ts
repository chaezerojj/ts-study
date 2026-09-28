import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as postLikesService from "./post-likes.service";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const postId = Number(req.params.postId);
    const result = await postLikesService.toggleLike(postId, req.user!.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const postId = Number(req.params.postId);
    const result = await postLikesService.getLikeCount(postId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
