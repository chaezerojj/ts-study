"use client";

import { useState } from "react";
import { apiFetch } from "@/app/lib/api";

type Props = {
  postId: number;
  initialCount: number;
};

export default function LikeButton({ postId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{ liked: boolean }>(
        `/posts/${postId}/likes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {
      alert("좋아요 처리 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
    >
      ♥ {count}
    </button>
  );
}
