import { ErrorRequestHandler } from "express";
import { AppError } from "../lib/errors";

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};