"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import OfflineBanner from "@/components/OfflineBanner";
import AuthGuard from "@/components/AuthGuard";
import { useUser } from "@/lib/user-context";
import { Place, Store, BrowseItem } from "@/lib/types";

function BrowseContent() {
  const { user } = useUser();
  const [places, setPlaces] = useState<Place[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [browseItems, setBrowseItems] = useState<BrowseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);

  const fetchPlacesAndStores = useCallback(async () => {
    try {
      const placesRes = await fetch("/api/places");
      if (!placesRes.ok) return;
      const placesData = await placesRes.json();
      setPlaces(placesData);

      const allStores: Store[] = [];
      for (const place of placesData) {
        const storesRes = await fetch(`/api/stores?place_id=${place.id}`);
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          allStores.push(...storesData);
        }
      }
      setStores(allStores);
      if (allStores.length > 0) {
        setSelectedStoreId(allStores[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacesAndStores();
  }, [fetchPlacesAndStores]);

  const fetchBrowseItems = useCallback(async () => {
    if (!selectedStoreId || !user) return;
    const res = await fetch(`/api/browse?store_id=${selectedStoreId}&exclude_user_id=${user.id}`);
    if (res.ok) {
      setBrowseItems(await res.json());
    }
  }, [selectedStoreId, user]);

  useEffect(() => {
    fetchBrowseItems();
  }, [fetchBrowseItems]);

  const handleCopy = async (item: BrowseItem) => {
    if (!user || copying) return;
    setCopying(item.id);
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: item.store_id,
          user_id: user.id,
          name: item.name,
          image_url: item.image_url,
          price: item.price,
          priority: item.priority,
          memo: item.memo,
        }),
      });
      setCopying(null);
    } catch {
      setCopying(null);
    }
  };

  const getPlaceName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return "";
    const place = places.find((p) => p.id === store.place_id);
    return place?.name ?? "";
  };

  return (
    <>
      <OfflineBanner />
      <TopBar title="둘러보기" showBack />

      <main className="flex-1 px-4 pb-8 pt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20">
            <p className="text-gray-500 text-sm">아직 매장이 없어요</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedStoreId === store.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {getPlaceName(store.id) ? `${getPlaceName(store.id)} · ` : ""}
                  {store.name}
                </button>
              ))}
            </div>

            {browseItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500 text-sm">이 매장에 다른 사람의 아이템이 없어요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {browseItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex rounded-xl border border-gray-300 bg-white overflow-hidden"
                  >
                    <div className="flex items-center gap-3 flex-1 p-3 min-w-0">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate block">{item.name}</span>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                          {item.price != null && (
                            <span className="font-bold text-dark">¥{item.price.toLocaleString()}</span>
                          )}
                          {item.priority === "must" && (
                            <span className="rounded bg-warning/20 px-1 py-0.5 text-[10px] font-bold text-warning">MUST</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-400">{item.user_name}님의 리스트</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(item)}
                      disabled={copying === item.id}
                      className="flex-shrink-0 border-l border-gray-300 px-4 text-xs font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-40"
                    >
                      {copying === item.id ? "담는중" : "나도\n담기"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default function BrowsePage() {
  return (
    <AuthGuard>
      <BrowseContent />
    </AuthGuard>
  );
}
