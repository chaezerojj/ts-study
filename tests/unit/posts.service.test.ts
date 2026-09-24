import { getPosts, getPostById, createPost, updatePost, deletePost } from "../../src/modules/posts/posts.service";

// prisma 전체를 모킹 — 실제 DB 연결 없이 가짜 함수로 대체
jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// 모킹된 prisma 가져오기 (타입 단언으로 mock 메서드 접근)
import prisma from "../../src/lib/prisma";
const mockPrisma = prisma as jest.Mocked<typeof prisma> & {
  post: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

// 각 테스트 전에 모든 mock 초기화 (이전 테스트 결과가 섞이지 않도록)
beforeEach(() => {
  jest.clearAllMocks();
});

// ────────────────────────────────────────────────────────────
// getPosts
// ────────────────────────────────────────────────────────────
describe("getPosts", () => {
  it("게시글 목록을 반환한다", async () => {
    const fakePosts = [
      { id: 1, title: "첫 번째 글", content: "내용1", authorId: 1, author: { id: 1, email: "a@test.com" } },
      { id: 2, title: "두 번째 글", content: "내용2", authorId: 2, author: { id: 2, email: "b@test.com" } },
    ];

    // findMany가 호출되면 fakePosts를 반환하도록 설정
    mockPrisma.post.findMany.mockResolvedValue(fakePosts as never);

    const result = await getPosts();

    expect(result).toEqual(fakePosts);
    expect(mockPrisma.post.findMany).toHaveBeenCalledTimes(1);
  });
});

// ────────────────────────────────────────────────────────────
// getPostById
// ────────────────────────────────────────────────────────────
describe("getPostById", () => {
  it("존재하는 id면 게시글을 반환한다", async () => {
    const fakePost = { id: 1, title: "글", content: "내용", authorId: 1, author: { id: 1, email: "a@test.com" } };
    mockPrisma.post.findUnique.mockResolvedValue(fakePost as never);

    const result = await getPostById(1);

    expect(result).toEqual(fakePost);
  });

  it("존재하지 않는 id면 에러를 던진다", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    // async 함수의 에러는 rejects.toThrow로 테스트
    await expect(getPostById(999)).rejects.toThrow("게시글을 찾을 수 없습니다.");
  });
});

// ────────────────────────────────────────────────────────────
// createPost
// ────────────────────────────────────────────────────────────
describe("createPost", () => {
  it("새 게시글을 생성하고 반환한다", async () => {
    const input = { title: "새 글", content: "새 내용" };
    const created = { id: 3, ...input, authorId: 1, createdAt: new Date(), updatedAt: new Date() };
    mockPrisma.post.create.mockResolvedValue(created as never);

    const result = await createPost(input, 1);

    expect(result).toEqual(created);
    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: { title: "새 글", content: "새 내용", authorId: 1 },
    });
  });
});

// ────────────────────────────────────────────────────────────
// updatePost
// ────────────────────────────────────────────────────────────
describe("updatePost", () => {
  const existingPost = { id: 1, title: "원래 제목", content: "원래 내용", authorId: 1 };

  it("본인 게시글을 수정하면 성공한다", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(existingPost as never);
    const updated = { ...existingPost, title: "수정된 제목" };
    mockPrisma.post.update.mockResolvedValue(updated as never);

    const result = await updatePost(1, { title: "수정된 제목" }, 1);

    expect(result.title).toBe("수정된 제목");
  });

  it("게시글이 없으면 에러를 던진다", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    await expect(updatePost(999, { title: "수정" }, 1)).rejects.toThrow("게시글을 찾을 수 없습니다.");
  });

  it("작성자가 아니면 권한 에러를 던진다", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(existingPost as never); // authorId: 1

    // userId: 2로 수정 시도 → 권한 없음
    await expect(updatePost(1, { title: "수정" }, 2)).rejects.toThrow("수정 권한이 없습니다.");
  });
});

// ────────────────────────────────────────────────────────────
// deletePost
// ────────────────────────────────────────────────────────────
describe("deletePost", () => {
  const existingPost = { id: 1, title: "글", content: "내용", authorId: 1 };

  it("본인 게시글을 삭제하면 성공한다", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(existingPost as never);
    mockPrisma.post.delete.mockResolvedValue(existingPost as never);

    // deletePost는 반환값이 없으므로 에러 없이 완료되는지만 확인
    await expect(deletePost(1, 1)).resolves.toBeUndefined();
  });

  it("게시글이 없으면 에러를 던진다", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    await expect(deletePost(999, 1)).rejects.toThrow("게시글을 찾을 수 없습니다.");
  });

  it("작성자가 아니면 권한 에러를 던진다", async () => {
    mockPrisma.post.findUnique.mockResolvedValue(existingPost as never);

    await expect(deletePost(1, 2)).rejects.toThrow("삭제 권한이 없습니다.");
  });
});
