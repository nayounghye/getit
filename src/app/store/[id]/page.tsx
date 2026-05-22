"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import FAB from "@/components/FAB";
import EmptyState from "@/components/EmptyState";
import OfflineBanner from "@/components/OfflineBanner";
import AuthGuard from "@/components/AuthGuard";
import { useUser } from "@/lib/user-context";
import { Item, Store } from "@/lib/types";

type Filter = "all" | "unchecked" | "checked";

function StoreContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/items?store_id=${id}&user_id=${user!.id}`);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const fetchStore = useCallback(async () => {
    const res = await fetch(`/api/stores/${id}`);
    if (res.ok) setStore(await res.json());
  }, [id]);

  useEffect(() => {
    fetchData();
    fetchStore();
  }, [fetchData, fetchStore]);

  const toggleCheck = async (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
      )
    );
    await fetch(`/api/items/${itemId}/check`, { method: "PATCH" });
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("이 아이템을 삭제할까요?")) return;
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    await fetch(`/api/items/${itemId}`, { method: "DELETE" });
  };

  const filtered = items.filter((item) => {
    if (filter === "unchecked") return !item.is_checked;
    if (filter === "checked") return item.is_checked;
    return true;
  });

  const uncheckedFirst = [...filtered].sort((a, b) => {
    if (a.is_checked !== b.is_checked) return a.is_checked ? 1 : -1;
    return a.sort_order - b.sort_order;
  });

  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.is_checked).length;
  const uncheckedCount = totalCount - checkedCount;

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: totalCount },
    { key: "unchecked", label: "미구매", count: uncheckedCount },
    { key: "checked", label: "완료", count: checkedCount },
  ];

  return (
    <>
      <OfflineBanner />
      <TopBar title={store?.name ?? "매장"} showBack />

      {store?.benefits && store.benefits.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-1 border-b border-gray-300">
          {store.benefits.map((b, i) => (
            <span key={i} className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              {b}
            </span>
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="sticky top-11 z-10 flex gap-1 bg-white px-4 py-2 border-b border-gray-300">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {f.label}({f.count})
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 px-4 pb-24 pt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="아직 아이템이 없어요"
            actionLabel="+ 아이템 추가하기"
            onAction={() => router.push(`/store/${id}/add`)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {uncheckedFirst.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-xl border border-gray-300 overflow-hidden transition-all duration-200 ${
                  item.is_checked ? "bg-gray-200 opacity-60" : "bg-white"
                }`}
              >
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="w-full text-left"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className={`h-full w-full object-cover transition-opacity duration-200 ${
                        item.is_checked ? "opacity-50" : ""
                      }`}
                    />
                    <div className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                      item.is_checked
                        ? "border-success bg-success"
                        : "border-white bg-white/60"
                    }`}>
                      {item.is_checked && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                    {item.priority === "must" && !item.is_checked && (
                      <span className="absolute top-2 left-2 rounded bg-warning/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        MUST
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className={`text-xs font-medium truncate ${
                      item.is_checked ? "text-gray-400 line-through" : ""
                    }`}>
                      {item.name}
                    </p>
                    {item.price != null && (
                      <p className={`text-[11px] font-bold mt-0.5 ${item.is_checked ? "text-gray-400" : "text-dark"}`}>
                        ¥{item.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute -right-1 -top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-danger text-white group-hover:flex"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <FAB onClick={() => router.push(`/store/${id}/add`)} />
    </>
  );
}

export default function StorePage() {
  return (
    <AuthGuard>
      <StoreContent />
    </AuthGuard>
  );
}
