"use client";

import { useRef, useState } from "react";

export default function SwipeActions({
  children,
  onEdit,
  onDelete,
}: {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);

  const buttonWidth = (onEdit && onDelete) ? 128 : 64;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = startX.current - e.touches[0].clientX;
    if (open) {
      setOffset(Math.max(0, Math.min(buttonWidth, buttonWidth + diff * -1)));
    } else {
      setOffset(Math.max(0, Math.min(buttonWidth, diff)));
    }
  };

  const handleTouchEnd = () => {
    if (offset > buttonWidth / 3) {
      setOffset(buttonWidth);
      setOpen(true);
    } else {
      setOffset(0);
      setOpen(false);
    }
  };

  const close = () => {
    setOffset(0);
    setOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute right-0 top-0 bottom-0 flex">
        {onEdit && (
          <button
            onClick={() => { close(); onEdit(); }}
            className="flex w-16 items-center justify-center bg-primary text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => { close(); onDelete(); }}
            className="flex w-16 items-center justify-center bg-danger text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        )}
      </div>
      <div
        className="relative z-10 bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
