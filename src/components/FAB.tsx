"use client";

export default function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95 transition-transform"
      style={{ maxWidth: "480px", right: "max(16px, calc((100vw - 480px) / 2 + 16px))" }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}
