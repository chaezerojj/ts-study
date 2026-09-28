import prisma from "../../lib/prisma";

export const toggleLike = async (postId: number, userId: number) => {
  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    // existing 있으면 삭제 -> liked:false 반환
    await prisma.postLike.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  // existing 없으면 생성 -> liked: true 반환
  await prisma.postLike.create({ data: { userId, postId } });
  return { liked: true };
};

// 좋아요 카운트
export const getLikeCount = async (postId: number) => {
  const count = await prisma.postLike.count({ where: { postId } });
  return { count };
};
