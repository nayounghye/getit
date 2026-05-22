"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import FAB from "@/components/FAB";
import EmptyState from "@/components/EmptyState";
import ProgressBar from "@/components/ProgressBar";
import Modal from "@/components/Modal";
import OfflineBanner from "@/components/OfflineBanner";
import AuthGuard from "@/components/AuthGuard";
import SwipeActions from "@/components/SwipeActions";
import { useUser } from "@/lib/user-context";
import Link from "next/link";
import { Place, StoreWithStats } from "@/lib/types";

function PlaceContent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [place, setPlace] = useState<Place | null>(null);
  const [stores, setStores] = useState<StoreWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreWithStats | null>(null);
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [memo, setMemo] = useState("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [placesRes, storesRes] = await Promise.all([
        fetch(`/api/places?user_id=${user!.id}`),
        fetch(`/api/stores?place_id=${id}&user_id=${user!.id}`),
      ]);
      if (placesRes.ok) {
        const allPlaces = await placesRes.json();
        setPlace(allPlaces.find((p: Place) => p.id === id) ?? null);
      }
      if (storesRes.ok) {
        setStores(await storesRes.json());
      }
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setEditingStore(null);
    setName("");
    setFloor("");
    setMemo("");
    setBenefits([]);
    setBenefitInput("");
    setModalOpen(true);
  };

  const openEdit = (store: StoreWithStats) => {
    setEditingStore(store);
    setName(store.name);
    setFloor(store.floor ?? "");
    setMemo(store.memo ?? "");
    setBenefits(store.benefits ?? []);
    setBenefitInput("");
    setModalOpen(true);
  };

  const addBenefit = () => {
    const trimmed = benefitInput.trim();
    if (!trimmed) return;
    setBenefits((prev) => [...prev, trimmed]);
    setBenefitInput("");
  };

  const removeBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      floor: floor.trim() || null,
      memo: memo.trim() || null,
      benefits,
    };

    if (editingStore) {
      await fetch(`/api/stores/${editingStore.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: id, ...payload }),
      });
    }
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm("이 매장을 삭제할까요? 하위 아이템도 모두 삭제됩니다.")) return;
    await fetch(`/api/stores/${storeId}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <>
      <OfflineBanner />
      <TopBar title={place?.name ?? "장소"} showBack />

      <main className="flex-1 px-4 pb-24 pt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            message="아직 매장이 없어요"
            actionLabel="+ 매장 추가하기"
            onAction={openAdd}
          />
        ) : (
          <div className="space-y-3">
            {stores.map((store) => (
              <SwipeActions
                key={store.id}
                onEdit={() => openEdit(store)}
                onDelete={() => handleDelete(store.id)}
              >
                <Link
                  href={`/store/${store.id}`}
                  className="block border border-gray-300 bg-white p-3 active:bg-gray-100 transition-colors rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">{store.name}</h2>
                    {store.floor && (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        {store.floor}
                      </span>
                    )}
                  </div>
                  {store.benefits && store.benefits.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {store.benefits.map((b, i) => (
                        <span key={i} className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {store.item_total}개 중 {store.item_checked}개 완료
                  </p>
                  <div className="mt-2">
                    <ProgressBar checked={store.item_checked} total={store.item_total} />
                  </div>
                </Link>
              </SwipeActions>
            ))}
          </div>
        )}
      </main>

      <FAB onClick={openAdd} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingStore ? "매장 수정" : "매장 추가"}>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="매장명 (예: 돈키호테)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
            autoFocus
          />
          <input
            type="text"
            placeholder="층수 (예: 3F)"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="메모 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div>
            <p className="mb-1.5 text-xs text-gray-500">혜택/할인</p>
            {benefits.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {benefits.map((b, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs text-success"
                  >
                    {b}
                    <button onClick={() => removeBenefit(i)} className="ml-0.5 text-success/60 hover:text-success">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="예: 네이버페이 10% 할인"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addBenefit}
                disabled={!benefitInput.trim()}
                className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success disabled:opacity-40"
              >
                추가
              </button>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {editingStore ? "수정" : "추가"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default function PlacePage() {
  return (
    <AuthGuard>
      <PlaceContent />
    </AuthGuard>
  );
}
