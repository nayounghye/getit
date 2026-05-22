"use client";

import { useRouter } from "next/navigation";

export default function TopBar({
  title,
  showBack = false,
  right,
}: {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex h-11 items-center bg-white/95 px-4 backdrop-blur-sm">
      {showBack ? (
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center -ml-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}
      <h1 className="flex-1 text-center text-xl font-bold truncate">{title}</h1>
      {right ?? <div className="w-8" />}
    </header>
  );
}
