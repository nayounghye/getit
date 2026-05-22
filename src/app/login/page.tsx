"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await login(name.trim());
    router.replace("/");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/animation.gif" alt="wave" width={64} height={64} className="mb-4" />
      <h1 className="text-2xl font-bold mb-1">Get-it</h1>
      <p className="text-sm text-gray-500 mb-8">여행 쇼핑 리스트</p>

      <input
        type="text"
        placeholder="이름을 입력하세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-base outline-none focus:border-primary"
        autoFocus
      />

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || saving}
        className="mt-4 w-full rounded-xl bg-primary py-3 text-base font-bold text-white disabled:opacity-40"
      >
        {saving ? "입장 중..." : "입장하기"}
      </button>
    </div>
  );
}
