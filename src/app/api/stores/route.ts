import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("place_id");
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!placeId) return NextResponse.json({ error: "place_id required" }, { status: 400 });

  const { data: stores, error } = await supabase
    .from("stores")
    .select("*, items(id, is_checked, user_id)")
    .eq("place_id", placeId)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = stores.map((store) => {
    const items = (store.items ?? []).filter(
      (i: { user_id: string }) => !userId || i.user_id === userId
    );
    return {
      id: store.id,
      place_id: store.place_id,
      name: store.name,
      floor: store.floor,
      memo: store.memo,
      benefits: store.benefits ?? [],
      sort_order: store.sort_order,
      created_at: store.created_at,
      item_total: items.length,
      item_checked: items.filter((i: { is_checked: boolean }) => i.is_checked).length,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { count } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .eq("place_id", body.place_id);

  const { data, error } = await supabase
    .from("stores")
    .insert({
      place_id: body.place_id,
      name: body.name,
      floor: body.floor ?? null,
      memo: body.memo ?? null,
      benefits: body.benefits ?? [],
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
