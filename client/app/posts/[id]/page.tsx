import Link from "next/link";
import { apiFetch } from "../../lib/api";
import LikeButton from "./LikeButton";

// ? 동적 라우트 [id]
// - 폴더 이름을 [id]로 만들면 /posts/1, /posts/42와 같은 URL을 모두 이 파일로 받음.
// - params로 id 값을 꺼냄

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: { id: number; email: string };
};

type Reply = {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; email: string };
};

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; email: string };
  replies: Reply[];
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post, comments, likes] = await Promise.all([
    apiFetch<Post>(`/posts/${id}`),
    apiFetch<Comment[]>(`/posts/${id}/comments`),
    apiFetch<{ count: number }>(`/posts/${id}/likes`),
  ]);
  return (
    <div className="flex flex-col gap-8">
      {/* 게시글 본문 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← 목록
          </Link>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {post.author.email} ·{" "}
          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
        </p>
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* 좋아요 */}
      <LikeButton postId={Number(id)} initialCount={likes.count} />

      {/* 댓글 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">댓글 {comments.length}개</h2>
        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm">첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="border border-gray-200 rounded p-4"
              >
                <p className="text-sm text-gray-500 mb-1">
                  {comment.author.email} ·{" "}
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="text-gray-800">{comment.content}</p>

                {/* 대댓글 */}
                {comment.replies.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-3 pl-4 border-l-2 border-gray-100">
                    {comment.replies.map((reply) => (
                      <li key={reply.id}>
                        <p className="text-sm text-gray-500 mb-1">
                          {reply.author.email} ·{" "}
                          {new Date(reply.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </p>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
