import express from "express";
import authRouter from "./modules/auth/auth.router";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
})

app.use("/auth", authRouter);

export default app;