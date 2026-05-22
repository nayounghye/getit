"use client";

import { useEffect, useRef } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[calc(100%-32px)] max-w-[448px] rounded-xl bg-white p-0 backdrop:bg-black/40"
    >
      <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
        <h2 className="text-base font-bold">{title}</h2>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
