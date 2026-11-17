"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import ProgressCharts from "./Charts";
type Row = { logged_on: string; weight_kg: number | null; waist_cm: number | null };
export default function WeightLog({ clientId, initial, entries }: { clientId: string; initial: Row[]; entries: any[] }) {
  const [rows, setRows] = useState(initial); const [w, setW] = useState(""); const [waist, setWaist] = useState(""); const [msg, setMsg] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const day = new Date().toISOString().slice(0, 10);
    const entry = { logged_on: day, weight_kg: Number(w), waist_cm: waist ? Number(waist) : null };
    const { error } = await supabaseBrowser().from("body_stats").upsert({ client_id: clientId, ...entry }, { onConflict: "client_id,logged_on" });
    if (error) return setMsg(error.message);
    setRows([...rows.filter(r => r.logged_on !== day), entry].sort((a, b) => (a.logged_on < b.logged_on ? -1 : 1))); setW(""); setWaist(""); setMsg("Saved.");
  }
  const field = "rounded-full border border-black/15 bg-white px-4 py-3 w-36";
  return (
    <div>
      <ProgressCharts stats={rows} entries={entries} />
      <form onSubmit={save} className="mt-6 flex gap-2 flex-wrap items-center rounded-2xl bg-paper p-3">
        <input className={field} type="number" step="0.1" required placeholder="Weight (kg)" value={w} onChange={e => setW(e.target.value)} />
        <input className={field} type="number" step="0.1" placeholder="Waist (cm)" value={waist} onChange={e => setWaist(e.target.value)} />
        <button className="btn bg-brand text-white">Save today</button>
        {msg && <span role="status" className="text-sm text-black/60">{msg}</span>}
      </form>
    </div>
  );
}
