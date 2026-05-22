"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import OfflineBanner from "@/components/OfflineBanner";
import AuthGuard from "@/components/AuthGuard";
import { useUser } from "@/lib/user-context";

function AddItemContent() {
  const { id: storeId } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [priority, setPriority] = useState<"must" | "optional">("optional");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const canSave = name.trim() && file;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      const itemRes = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          user_id: user!.id,
          name: name.trim(),
          image_url: url,
          price: price ? parseInt(price) : null,
          priority,
          memo: memo.trim() || null,
        }),
      });

      if (itemRes.ok) {
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <OfflineBanner />
      <TopBar title="아이템 추가" showBack />

      <main className="flex-1 px-4 pb-8 pt-4">
        <div className="space-y-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-48 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 overflow-hidden transition-colors hover:border-primary"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-3xl">📷</div>
                <p className="mt-1 text-xs text-gray-500">탭하여 사진 업로드</p>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <input
            type="text"
            placeholder="이름 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />

          <input
            type="number"
            placeholder="가격 (엔)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />

          <div>
            <p className="mb-1.5 text-xs text-gray-500">우선순위</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPriority("must")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  priority === "must"
                    ? "bg-warning/20 text-warning border border-warning"
                    : "bg-gray-100 text-gray-500 border border-transparent"
                }`}
              >
                꼭 살 것
              </button>
              <button
                onClick={() => setPriority("optional")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  priority === "optional"
                    ? "bg-primary/10 text-primary border border-primary"
                    : "bg-gray-100 text-gray-500 border border-transparent"
                }`}
              >
                여유 있으면
              </button>
            </div>
          </div>

          <textarea
            placeholder="메모 (예: OO이 추천, 2개 사기)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />

          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </main>
    </>
  );
}

export default function AddItemPage() {
  return (
    <AuthGuard>
      <AddItemContent />
    </AuthGuard>
  );
}
