export default function ProgressBar({
  checked,
  total,
}: {
  checked: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-success transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
}
