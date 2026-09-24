import prisma from "../../lib/prisma";
import { CreatePostInput, UpdatePostInput } from "./posts.schema";

export async function getPosts() { 
  return prisma.post.findMany({
    include: { author: { select: {id: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostById(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, email: true } } },
  });

  if (!post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  return post;
}

export async function createPost(input: CreatePostInput, authorId: number) {
  return prisma.post.create({
    data: { ...input, authorId },
  });
}

export async function updatePost(id: number, input: UpdatePostInput, userId: number) {
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  if (post.authorId !== userId) {
    throw new Error("수정 권한이 없습니다.");
  }

  return prisma.post.update({
    where: { id },
    data: input, 
  });
}

export async function deletePost(id: number, userId: number) {
  const post = await prisma.post.findUnique({ where: { id }});

  if (!post) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  if (post.authorId !== userId) {
    throw new Error("삭제 권한이 없습니다.");
  }

  await prisma.post.delete({ where: { id } });
}