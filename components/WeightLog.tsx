"use client";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabaseBrowser } from "@/lib/supabase/client";
type Row = { logged_on: string; weight_kg: number | null };
export default function WeightLog({ clientId, initial }: { clientId: string; initial: Row[] }) {
  const [rows, setRows] = useState(initial); const [w, setW] = useState(""); const [waist, setWaist] = useState(""); const [msg, setMsg] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const day = new Date().toISOString().slice(0, 10);
    const { error } = await supabaseBrowser().from("body_stats").upsert(
      { client_id: clientId, logged_on: day, weight_kg: Number(w), waist_cm: waist ? Number(waist) : null }, { onConflict: "client_id,logged_on" });
    if (error) return setMsg(error.message);
    setRows([...rows.filter(r => r.logged_on !== day), { logged_on: day, weight_kg: Number(w) }]); setW(""); setWaist(""); setMsg("Saved.");
  }
  const field = "rounded-full border border-black/15 bg-white px-4 py-3 w-32";
  return (
    <div>
      <div className="h-56">
        {rows.length ? (
          <ResponsiveContainer><LineChart data={rows}>
            <XAxis dataKey="logged_on" tickFormatter={d => d.slice(5)} stroke="#999" fontSize={12} />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} stroke="#999" fontSize={12} width={36} />
            <Tooltip /><Line type="monotone" dataKey="weight_kg" stroke="#ff5a1f" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart></ResponsiveContainer>
        ) : <p className="text-black/60">No entries yet. Log today's weight to start your chart.</p>}
      </div>
      <form onSubmit={save} className="mt-4 flex gap-2 flex-wrap items-center">
        <input className={field} type="number" step="0.1" required placeholder="Weight (kg)" value={w} onChange={e => setW(e.target.value)} />
        <input className={field} type="number" step="0.1" placeholder="Waist (cm)" value={waist} onChange={e => setWaist(e.target.value)} />
        <button className="btn bg-brand text-white">Save today</button>
        {msg && <span role="status" className="text-sm text-black/60">{msg}</span>}
      </form>
    </div>
  );
}
