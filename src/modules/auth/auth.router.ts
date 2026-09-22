import { Router } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { login, register } from "./auth.service";

const router = Router();

router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  try {
    const data = await register(result.data);
    res.status(201).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다";
    res.status(409).json({ message });
  }
});

router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten() });
    return;
  }

  try {
    const data = await login(result.data);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다";
    res.status(401).json({ message });
  }
});

export default router;