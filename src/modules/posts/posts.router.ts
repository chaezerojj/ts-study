import { Router, Request, Response, NextFunction } from "express";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  updatePost,
} from "./posts.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createPostSchema,
  updatePostSchema,
  paginationSchema,
} from "./posts.schema";

const router = Router();

// ! GET /posts - 게시글 목록 조회
/**
 * @openapi
 * /posts:
 *   get:
 *     summary: 게시글 목록 조회
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten() });
      return;
    }
    const posts = await getPosts(parsed.data);
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// ! GET /posts/:id - 게시글 단건 조회
/**
 * @openapi
 * /posts/{id}:
 *   get:
 *     summary: 게시글 단건 조회
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공
 *       404:
 *         description: 게시글 없음
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await getPostById(Number(req.params.id));
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// ! POST /posts - 게시글 생성 (자물쇠 아이콘)
/**
 * @openapi
 * /posts:
 *   post:
 *     summary: 게시글 생성
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 생성 성공
 *       401:
 *         description: 인증 필요
 */
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);

// ! PUT /posts/:id - 게시글 수정 (자물쇠 아이콘)
/**
 * @openapi
 * /posts/{id}:
 *   put:
 *     summary: 게시글 수정
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시글 없음
 */
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = updatePostSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ errors: result.error.flatten() });
        return;
      }
      const post = await updatePost(
        Number(req.params.id),
        result.data,
        req.user!.id,
      );
      res.json(post);
    } catch (err) {
      next(err);
    }
  },
);

// ! DELETE /posts/:id - 게시글 삭제 (자물쇠 아이콘)
/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     summary: 게시글 삭제
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: 삭제 성공
 *       401:
 *         description: 인증 필요
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 게시글 없음
 */
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deletePost(Number(req.params.id), req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
