"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });
  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
  }
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          TS Board
        </Link>
        <div className="flex gap-4 text-sm">
          {isLoggedIn ? (
            <>
              <Link
                href="/posts/new"
                className="text-gray-600 hover:text-black"
              >
                글쓰기
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-black"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-black">
                로그인
              </Link>
              <Link href="/register" className="text-gray-600 hover:text-black">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
