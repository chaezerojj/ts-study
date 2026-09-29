import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.router";
import postsRouter from "./modules/posts/posts.router";
import commentsRouter from "./modules/comments/comments.router";
import postLikesRouter from "./modules/post-likes/post-likes.router";
import { errorMiddleware } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";

const app = express();

app.use(cors({ origin: "http://localhost:3001" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/posts/:postId/comments", commentsRouter);
app.use("/posts/:postId/likes", postLikesRouter);

app.use(errorMiddleware);

export default app;