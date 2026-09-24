import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

// 각 테스트 suite 종료 후 DB 정리 + Prisma 연결 끊기
afterAll(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// 각 테스트 전에 users 테이블을 비워서 독립적인 상태 보장
beforeEach(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

// ────────────────────────────────────────────────────────────
// POST /auth/register
// ────────────────────────────────────────────────────────────
describe("POST /auth/register", () => {
  it("올바른 입력이면 201과 유저 정보를 반환한다", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("test@test.com");
    // 비밀번호는 응답에 포함되면 안 됨
    expect(res.body).not.toHaveProperty("password");
  });

  it("이메일 형식이 잘못되면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "not-an-email", password: "password123" });

    expect(res.status).toBe(400);
  });

  it("비밀번호가 너무 짧으면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "123" });

    expect(res.status).toBe(400);
  });

  it("이미 존재하는 이메일이면 409를 반환한다", async () => {
    // 먼저 유저 생성
    await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "password123" });

    // 같은 이메일로 재가입 시도
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "password123" });

    expect(res.status).toBe(409);
  });
});

// ────────────────────────────────────────────────────────────
// POST /auth/login
// ────────────────────────────────────────────────────────────
describe("POST /auth/login", () => {
  // 테스트용 유저를 미리 생성해두는 헬퍼
  beforeEach(async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "user@test.com", password: "password123" });
  });

  it("올바른 자격증명이면 200과 토큰을 반환한다", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  it("존재하지 않는 이메일이면 401을 반환한다", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@test.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("비밀번호가 틀리면 401을 반환한다", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@test.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });
});
