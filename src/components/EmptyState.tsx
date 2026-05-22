export default function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
      <div className="text-5xl">🛒</div>
      <p className="text-gray-500 text-sm">{message}</p>
      <button
        onClick={onAction}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}
