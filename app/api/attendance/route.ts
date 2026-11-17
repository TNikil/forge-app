import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
export async function GET() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: me } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (!me || me.role === "client") return new NextResponse("Forbidden", { status: 403 });
  let rows: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from("attendance").select("client_id,day,checked_in_at").order("checked_in_at", { ascending: false }).range(from, from + 999);
    rows.push(...(data ?? [])); if ((data?.length ?? 0) < 1000) break;
  }
  const { data: people } = await sb.from("profiles").select("id,full_name,email");
  const who = new Map((people ?? []).map(p => [p.id, p]));
  const q = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = ["Date,Checked in at,Name,Email", ...rows.map(r => [r.day, r.checked_in_at, who.get(r.client_id)?.full_name, who.get(r.client_id)?.email].map(q).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="attendance-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
