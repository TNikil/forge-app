"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Media from "./Media";
type Item = { id: string; exercise_name: string; sets: number; reps: number; notes: string | null; media_url: string | null };
export default function RoutineChecklist({ clientId, items, logs }: { clientId: string; items: Item[]; logs: { item_id: string; sets_done: number }[] }) {
  const [done, setDone] = useState<Record<string, number>>(Object.fromEntries(logs.map(l => [l.item_id, l.sets_done])));
  const [err, setErr] = useState("");
  async function tap(id: string, n: number) {
    const next = done[id] === n ? n - 1 : n;
    setDone({ ...done, [id]: next }); setErr("");
    const { error } = await supabaseBrowser().from("set_logs").upsert(
      { item_id: id, client_id: clientId, logged_on: new Date().toISOString().slice(0, 10), sets_done: next }, { onConflict: "item_id,client_id,logged_on" });
    if (error) setErr(error.message);
  }
  if (!items.length) return <p className="text-black/60">Your trainer hasn't assigned a routine yet.</p>;
  return (
    <div className="space-y-5">
      {items.map(it => (
        <div key={it.id} className="rounded-2xl border border-black/10 p-4">
          <div className="flex justify-between items-baseline"><b className="text-lg">{it.exercise_name}</b><span className="text-sm text-black/50">{it.sets} × {it.reps}</span></div>
          {it.notes && <p className="text-sm text-black/60 mt-1">{it.notes}</p>}
          {it.media_url && <div className="mt-3"><Media url={it.media_url} /></div>}
          <div className="mt-3 flex gap-2 flex-wrap">
            {Array.from({ length: it.sets }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => tap(it.id, n)} aria-pressed={(done[it.id] ?? 0) >= n} aria-label={`Set ${n}`}
                className={`size-11 rounded-full font-bold ${(done[it.id] ?? 0) >= n ? "bg-brand text-white" : "bg-black/5 text-black/50"}`}>{n}</button>
            ))}
          </div>
        </div>
      ))}
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
