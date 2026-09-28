import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";

let token: string;
let postId: number;

beforeAll(async () => {
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await request(app)
    .post("/auth/register")
    .send({ email: "likes@test.com", password: "password123" });

  const login = await request(app)
    .post("/auth/login")
    .send({ email: "likes@test.com", password: "password123" });

  token = login.body.token;
});

beforeEach(async () => {
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();

  const res = await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "좋아요 테스트 글", content: "좋아요 테스트 내용" });

  postId = res.body.id;
});

afterAll(async () => {
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("GET /posts/:postId/likes", () => {
  it("좋아요가 없으면 count 0을 반환한다", async () => {
    const res = await request(app).get(`/posts/${postId}/likes`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it("좋아요가 있으면 count 1을 반환한다", async () => {
    await request(app)
      .post(`/posts/${postId}/likes`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app).get(`/posts/${postId}/likes`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });
});

describe("POST /posts/:postId/likes", () => {
  it("토큰 없이 요청하면 401을 반환한다", async () => {
    const res = await request(app).post(`/posts/${postId}/likes`);

    expect(res.status).toBe(401);
  });

  it("처음 누르면 liked: true를 반환한다", async () => {
    const res = await request(app)
      .post(`/posts/${postId}/likes`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
  });

  it("두 번 누르면 liked: false를 반환한다 (토글)", async () => {
    await request(app)
      .post(`/posts/${postId}/likes`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post(`/posts/${postId}/likes`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
  });

  it("좋아요 후 취소하면 count가 0으로 돌아온다", async () => {
    await request(app)
      .post(`/posts/${postId}/likes`)
      .set("Authorization", `Bearer ${token}`);

    await request(app)
      .post(`/posts/${postId}/likes`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app).get(`/posts/${postId}/likes`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
  });
});