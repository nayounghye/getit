import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("items")
    .update({
      name: body.name,
      image_url: body.image_url,
      price: body.price,
      priority: body.priority,
      memo: body.memo,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: item } = await supabase
    .from("items")
    .select("image_url")
    .eq("id", id)
    .single();

  if (item?.image_url) {
    const path = item.image_url.split("/item-images/")[1];
    if (path) {
      await supabase.storage.from("item-images").remove([path]);
    }
  }

  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
