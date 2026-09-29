import Link from "next/link";
import { apiFetch } from "./lib/api";

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: { id: number; email: string };
};

type PostsResponse = {
  data: Post[];
  total: number;
  page: number;
  totalPages: number;
};

export default async function HomePage() {
  const result = await apiFetch<PostsResponse>("/posts?page=1&limit=10");
  const posts = result.data;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">게시글 목록</h1>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
        >
          글쓰기
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-16">게시글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="block px-4 py-4 hover:bg-gray-50"
              >
                <p className="font-medium text-gray-900">{post.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {post.author.email} ·{" "}
                  {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
