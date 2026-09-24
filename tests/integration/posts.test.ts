import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

// 테스트 전체에서 재사용할 토큰과 유저 ID
let tokenA: string;   // 유저 A의 JWT
let tokenB: string;   // 유저 B의 JWT (권한 테스트용)
let userAId: number;

// 모든 테스트 시작 전: 유저 2명 생성 후 각각 로그인
beforeAll(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 유저 A 생성 + 로그인
  const regA = await request(app)
    .post("/auth/register")
    .send({ email: "usera@test.com", password: "password123" });
  userAId = regA.body.id;

  const loginA = await request(app)
    .post("/auth/login")
    .send({ email: "usera@test.com", password: "password123" });
  tokenA = loginA.body.token;

  // 유저 B 생성 + 로그인
  await request(app)
    .post("/auth/register")
    .send({ email: "userb@test.com", password: "password123" });
  const loginB = await request(app)
    .post("/auth/login")
    .send({ email: "userb@test.com", password: "password123" });
  tokenB = loginB.body.token;
});

// 각 테스트 전에 게시글만 초기화 (유저는 유지)
beforeEach(async () => {
  await prisma.post.deleteMany();
});

afterAll(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// ────────────────────────────────────────────────────────────
// GET /posts
// ────────────────────────────────────────────────────────────
describe("GET /posts", () => {
  it("게시글 목록을 반환한다 (인증 불필요)", async () => {
    const res = await request(app).get("/posts");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("게시글이 있으면 목록에 포함된다", async () => {
    // 먼저 게시글 생성
    await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "테스트 글", content: "내용" });

    const res = await request(app).get("/posts");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("테스트 글");
  });
});

// ────────────────────────────────────────────────────────────
// POST /posts
// ────────────────────────────────────────────────────────────
describe("POST /posts", () => {
  it("인증된 유저가 게시글을 생성하면 201을 반환한다", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "새 게시글", content: "내용입니다" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("새 게시글");
    expect(res.body.authorId).toBe(userAId);
  });

  it("토큰 없이 요청하면 401을 반환한다", async () => {
    const res = await request(app)
      .post("/posts")
      .send({ title: "새 게시글", content: "내용" });

    expect(res.status).toBe(401);
  });

  it("제목이 없으면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ content: "내용만 있음" });

    expect(res.status).toBe(400);
  });
});

// ────────────────────────────────────────────────────────────
// GET /posts/:id
// ────────────────────────────────────────────────────────────
describe("GET /posts/:id", () => {
  it("존재하는 게시글을 조회하면 200을 반환한다", async () => {
    const created = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "조회 테스트", content: "내용" });
    const postId = created.body.id;

    const res = await request(app).get(`/posts/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(postId);
  });

  it("존재하지 않는 id면 404를 반환한다", async () => {
    const res = await request(app).get("/posts/99999");

    expect(res.status).toBe(404);
  });
});

// ────────────────────────────────────────────────────────────
// PUT /posts/:id
// ────────────────────────────────────────────────────────────
describe("PUT /posts/:id", () => {
  let postId: number;

  beforeEach(async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "수정 전", content: "원래 내용" });
    postId = res.body.id;
  });

  it("작성자가 수정하면 200과 수정된 내용을 반환한다", async () => {
    const res = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "수정 후" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("수정 후");
  });

  it("다른 유저가 수정하면 403을 반환한다", async () => {
    const res = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "무단 수정" });

    expect(res.status).toBe(403);
  });

  it("토큰 없이 수정하면 401을 반환한다", async () => {
    const res = await request(app)
      .put(`/posts/${postId}`)
      .send({ title: "무단 수정" });

    expect(res.status).toBe(401);
  });
});

// ────────────────────────────────────────────────────────────
// DELETE /posts/:id
// ────────────────────────────────────────────────────────────
describe("DELETE /posts/:id", () => {
  let postId: number;

  beforeEach(async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "삭제 대상", content: "삭제될 내용" });
    postId = res.body.id;
  });

  it("작성자가 삭제하면 204를 반환한다", async () => {
    const res = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(204);
  });

  it("다른 유저가 삭제하면 403을 반환한다", async () => {
    const res = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it("토큰 없이 삭제하면 401을 반환한다", async () => {
    const res = await request(app)
      .delete(`/posts/${postId}`);

    expect(res.status).toBe(401);
  });
});
