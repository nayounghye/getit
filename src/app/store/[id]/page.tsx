"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import FAB from "@/components/FAB";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import OfflineBanner from "@/components/OfflineBanner";
import AuthGuard from "@/components/AuthGuard";
import SwipeActions from "@/components/SwipeActions";
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPriority, setEditPriority] = useState<"must" | "optional">("optional");
  const [editMemo, setEditMemo] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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

  const openEditItem = (item: Item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price != null ? String(item.price) : "");
    setEditPriority(item.priority);
    setEditMemo(item.memo ?? "");
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingItem || !editName.trim() || editSaving) return;
    setEditSaving(true);
    try {
      await fetch(`/api/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          image_url: editingItem.image_url,
          price: editPrice ? parseInt(editPrice) : null,
          priority: editPriority,
          memo: editMemo.trim() || null,
        }),
      });
      setEditModalOpen(false);
      fetchData();
    } finally {
      setEditSaving(false);
    }
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
              <SwipeActions
                key={item.id}
                onEdit={() => openEditItem(item)}
                onDelete={() => handleDelete(item.id)}
              >
                <div
                  className={`overflow-hidden transition-all duration-200 border border-gray-300 rounded-xl ${
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
                </div>
              </SwipeActions>
            ))}
          </div>
        )}
      </main>

      <FAB onClick={() => router.push(`/store/${id}/add`)} />

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="아이템 수정">
        <div className="space-y-3">
          {editingItem && (
            <div className="h-32 w-full overflow-hidden rounded-lg bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editingItem.image_url} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <input
            type="text"
            placeholder="이름 *"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
            autoFocus
          />
          <input
            type="number"
            placeholder="가격 (엔)"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setEditPriority("must")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                editPriority === "must"
                  ? "bg-warning/20 text-warning border border-warning"
                  : "bg-gray-100 text-gray-500 border border-transparent"
              }`}
            >
              꼭 살 것
            </button>
            <button
              onClick={() => setEditPriority("optional")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                editPriority === "optional"
                  ? "bg-primary/10 text-primary border border-primary"
                  : "bg-gray-100 text-gray-500 border border-transparent"
              }`}
            >
              여유 있으면
            </button>
          </div>
          <textarea
            placeholder="메모"
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
          <button
            onClick={handleEditSave}
            disabled={!editName.trim() || editSaving}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {editSaving ? "저장 중..." : "수정"}
          </button>
        </div>
      </Modal>
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
