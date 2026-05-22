import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("name", name)
    .single();

  if (existing) {
    return NextResponse.json(existing);
  }

  const { data, error } = await supabase
    .from("users")
    .insert({ name })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
