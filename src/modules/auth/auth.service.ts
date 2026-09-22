import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import { RegisterInput, LoginInput } from "./auth.schema";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("이미 사용중인 이메일입니다.");
  }

  const hashed = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: { email: input.email, password: hashed },
  });

  return { id: user.id, email: user.email };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const valid = await bcrypt.compare(input.password, user.password);

  if (!valid) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return { token };
}