import { Router } from "express";
import { createPost, deletePost, getPostById, getPosts, updatePost } from "./posts.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createPostSchema, updatePostSchema } from "./posts.schema";

const router = Router();

router.get("/", async (req, res) => {
  const posts = await getPosts();
  res.json(posts);
});

router.get("/:id", async (req, res) => {
  try {
    const post = await getPostById(Number(req.params.id));
    res.json(post);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    res.status(404).json({ message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const result = createPostSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten() });
    return;
  }

  const post = await createPost(result.data, req.user!.userId);
  res.status(201).json(post);
});

router.put("/:id", authMiddleware, async (req, res) => {
  const result = updatePostSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten() });
    return;
  }

  try {
    const post = await updatePost(Number(req.params.id), result.data, req.user!.userId);
    res.json(post);
  } catch (err: unknown){
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    res.status(403).json({ message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await deletePost(Number(req.params.id), req.user!.userId);
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    res.status(403).json({ message });
  }
});

export default router;