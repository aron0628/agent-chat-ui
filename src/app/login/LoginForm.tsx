"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("사용자 ID/이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-purple-50 px-4">
      {/* Logo & Title */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-c.svg" alt="mf" width={37} height={33} style={{ height: '36px', width: 'auto' }} />
          <span className="text-3xl font-bold text-gray-800">모바일팩토리</span>
        </div>
        <p className="text-base text-gray-500">
          AI 채팅 시스템에 로그인하세요.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              사용자 ID 또는 이메일
            </label>
            <input
              id="email"
              type="text"
              placeholder="user123 또는 name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-lg border-0 bg-gray-100 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-lg border-0 bg-gray-100 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
