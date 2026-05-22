import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: item } = await supabase
    .from("items")
    .select("is_checked")
    .eq("id", id)
    .single();

  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("items")
    .update({ is_checked: !item.is_checked })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
