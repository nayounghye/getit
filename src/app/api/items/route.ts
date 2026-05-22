import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("store_id");
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!storeId) return NextResponse.json({ error: "store_id required" }, { status: 400 });

  let query = supabase
    .from("items")
    .select("*")
    .eq("store_id", storeId)
    .order("is_checked")
    .order("sort_order");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.user_id) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  const { count } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("store_id", body.store_id)
    .eq("user_id", body.user_id);

  const { data, error } = await supabase
    .from("items")
    .insert({
      store_id: body.store_id,
      user_id: body.user_id,
      name: body.name,
      image_url: body.image_url,
      price: body.price ?? null,
      priority: body.priority ?? "optional",
      memo: body.memo ?? null,
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
