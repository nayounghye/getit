import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("store_id");
  const excludeUserId = request.nextUrl.searchParams.get("exclude_user_id");
  if (!storeId) return NextResponse.json({ error: "store_id required" }, { status: 400 });

  let query = supabase
    .from("items")
    .select("*, users!inner(name)")
    .eq("store_id", storeId)
    .order("sort_order");

  if (excludeUserId) {
    query = query.neq("user_id", excludeUserId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((item) => ({
    ...item,
    user_name: (item.users as { name: string })?.name ?? "",
    users: undefined,
  }));

  return NextResponse.json(result);
}
