import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");

  const { data: places, error } = await supabase
    .from("places")
    .select("*, stores(id, items(id, is_checked, user_id))")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = places.map((place) => {
    const stores = place.stores ?? [];
    let itemTotal = 0;
    let itemChecked = 0;
    for (const store of stores) {
      const items = (store.items ?? []).filter(
        (i: { user_id: string }) => !userId || i.user_id === userId
      );
      itemTotal += items.length;
      itemChecked += items.filter((i: { is_checked: boolean }) => i.is_checked).length;
    }
    return {
      id: place.id,
      name: place.name,
      description: place.description,
      sort_order: place.sort_order,
      created_at: place.created_at,
      store_count: stores.length,
      item_total: itemTotal,
      item_checked: itemChecked,
      single_store_id: stores.length === 1 ? stores[0].id : null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { count } = await supabase
    .from("places")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("places")
    .insert({ name: body.name, description: body.description ?? null, sort_order: count ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
