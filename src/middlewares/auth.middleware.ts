import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({ message: "인증 토큰이 없습니다."});
    return;
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "유효하지 않은 토큰입니다."});
  }
}