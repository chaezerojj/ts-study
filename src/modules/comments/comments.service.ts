import prisma from "../../lib/prisma";
import { CreateCommentInput } from "./comments.schema";

export const createCommment = async (
  postId: number,
  authorId: number,
  input: CreateCommentInput,
) => {
  return prisma.comment.create({
    data: {
      content: input.content,
      postId,
      authorId,
      parentId: input.parentId ?? null, // parentId가 undefined면 null로 저장
    },
  });
};

export const getCommentsByPostId = async (postId: number) => {
  return prisma.comment.findMany({
    // parentId: null -> 최상위 댓글만 조회, replies로 대댓글 한번에 include
    where: { postId, parentId: null },
    include: {
      author: { select: { id: true, email: true } },
      replies: {
        include: {
          author: { select: { id: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

export const deleteComment = async (id: number, authorId: number) => {
  const comment = await prisma.comment.findUnique({ where: { id } });

  // 에러 문자열로 던지기 -> posts 모듈과 같은 패턴
  if (!comment) throw new Error("NOT_FOUND");
  // 작성자 본인 확인 후 삭제
  if (comment.authorId !== authorId) throw new Error("FORBIDDEN");

  return prisma.comment.delete({ where: { id } });
};
