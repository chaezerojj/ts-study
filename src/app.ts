import express from "express";
import authRouter from "./modules/auth/auth.router";
import postsRouter from "./modules/posts/posts.router";
import commentsRouter from "./modules/comments/comments.router";
import postLikesRouter from "./modules/post-likes/post-likes.router";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/posts/:postId/comments", commentsRouter);
app.use("/posts/:postId/likes", postLikesRouter);

app.use(errorMiddleware);

export default app;