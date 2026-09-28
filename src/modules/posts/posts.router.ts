import { Router, Request, Response, NextFunction } from "express";
import { createPost, deletePost, getPostById, getPosts, updatePost } from "./posts.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createPostSchema, updatePostSchema } from "./posts.schema";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await getPosts();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await getPostById(Number(req.params.id));
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = createPostSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten() });
      return;
    }
    const post = await createPost(result.data, req.user!.id);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updatePostSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten() });
      return;
    }
    const post = await updatePost(Number(req.params.id), result.data, req.user!.id);
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deletePost(Number(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;