"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import FAB from "@/components/FAB";
import EmptyState from "@/components/EmptyState";
import ProgressBar from "@/components/ProgressBar";
import Modal from "@/components/Modal";
import OfflineBanner from "@/components/OfflineBanner";
import AuthGuard from "@/components/AuthGuard";
import SwipeActions from "@/components/SwipeActions";
import { useUser } from "@/lib/user-context";
import { PlaceWithStats } from "@/lib/types";

function HomeContent() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [places, setPlaces] = useState<PlaceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceWithStats | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isComplex, setIsComplex] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPlaces = useCallback(async () => {
    try {
      const res = await fetch(`/api/places?user_id=${user!.id}`);
      if (res.ok) {
        const data = await res.json();
        setPlaces(data);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const openAdd = () => {
    setEditingPlace(null);
    setName("");
    setDescription("");
    setIsComplex(false);
    setModalOpen(true);
  };

  const openEdit = (place: PlaceWithStats) => {
    setEditingPlace(place);
    setName(place.name);
    setDescription(place.description ?? "");
    setIsComplex(place.store_count > 1);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);

    try {
    if (editingPlace) {
      await fetch(`/api/places/${editingPlace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
    } else {
      const placeRes = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, is_complex: isComplex }),
      });

      if (placeRes.ok && !isComplex) {
        const place = await placeRes.json();
        await fetch("/api/stores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place_id: place.id, name: name.trim() }),
        });
      }
    }
    setModalOpen(false);
    fetchPlaces();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 장소를 삭제할까요? 하위 매장과 아이템도 모두 삭제됩니다.")) return;
    await fetch(`/api/places/${id}`, { method: "DELETE" });
    fetchPlaces();
  };

  const handlePlaceClick = (place: PlaceWithStats) => {
    if (place.single_store_id) {
      router.push(`/store/${place.single_store_id}`);
    } else {
      router.push(`/place/${place.id}`);
    }
  };

  return (
    <>
      <OfflineBanner />
      <TopBar
        title="Get-it"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/browse")}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 text-xs font-medium"
            >
              둘러보기
            </button>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
              title={user?.name}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        }
      />

      <main className="flex-1 px-4 pb-24 pt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : places.length === 0 ? (
          <EmptyState
            message="아직 장소가 없어요"
            actionLabel="+ 장소 추가하기"
            onAction={openAdd}
          />
        ) : (
          <div className="space-y-3">
            {places.map((place) => (
              <SwipeActions
                key={place.id}
                onEdit={() => openEdit(place)}
                onDelete={() => handleDelete(place.id)}
              >
                <button
                  onClick={() => handlePlaceClick(place)}
                  className="w-full text-left block border border-gray-300 bg-white p-3 active:bg-gray-100 transition-colors rounded-xl"
                >
                  <h2 className="text-base font-semibold">{place.name}</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {place.store_count > 1 ? `매장 ${place.store_count}개 · ` : ""}
                    {place.item_checked}/{place.item_total} 완료
                  </p>
                  <div className="mt-2">
                    <ProgressBar checked={place.item_checked} total={place.item_total} />
                  </div>
                </button>
              </SwipeActions>
            ))}
          </div>
        )}
      </main>

      <FAB onClick={openAdd} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingPlace ? "장소 수정" : "장소 추가"}>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="장소명 (예: 돈키호테, 캐널시티)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
            autoFocus
          />
          <input
            type="text"
            placeholder="설명 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          {!editingPlace && (
            <button
              type="button"
              onClick={() => setIsComplex(!isComplex)}
              className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                isComplex ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
            >
              <span className={isComplex ? "text-primary font-medium" : "text-gray-500"}>
                복합몰 (매장 여러 개)
              </span>
              <div className={`h-5 w-9 rounded-full transition-colors ${isComplex ? "bg-primary" : "bg-gray-300"}`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${isComplex ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {saving ? "저장 중..." : editingPlace ? "수정" : "추가"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
