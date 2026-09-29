import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TS Board",
  description: "TypeScript 게시판",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">TS Board</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/login" className="text-gray-600 hover:text-black">로그인</Link>
              <Link href="/register" className="text-gray-600 hover:text-black">회원가입</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}