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
  if (!items.length) return <p className="text-black/60">Your trainer hasn't assigned a routine yet. It will show up here.</p>;
  const total = items.reduce((a, i) => a + i.sets, 0);
  const got = items.reduce((a, i) => a + Math.min(done[i.id] ?? 0, i.sets), 0);
  return (
    <div>
      <div className="mb-5">
        <div className="flex justify-between text-sm font-semibold mb-2"><span>{got === total ? "Workout complete. Great work." : "Today's progress"}</span><span>{got}/{total} sets</span></div>
        <div className="h-3 rounded-full bg-black/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all" style={{ width: `${total ? (got / total) * 100 : 0}%` }} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(it => {
          const d = done[it.id] ?? 0, full = d >= it.sets;
          return (
            <div key={it.id} className={`rounded-3xl bg-ink text-white p-5 ${full ? "ring-2 ring-brand" : ""}`}>
              {it.media_url && <div className="mb-4"><Media url={it.media_url} /></div>}
              <div className="flex items-start justify-between gap-3">
                <h3 className="display text-2xl">{it.exercise_name}</h3>
                <span className="rounded-full bg-brand px-3 py-1 text-sm font-bold whitespace-nowrap">{it.sets} × {it.reps}</span>
              </div>
              {it.notes && <p className="mt-2 text-sm text-white/60">{it.notes}</p>}
              <div className="mt-4 flex gap-2 flex-wrap">
                {Array.from({ length: it.sets }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => tap(it.id, n)} aria-pressed={d >= n} aria-label={`Set ${n}`}
                    className={`size-12 rounded-full font-extrabold transition ${d >= n ? "bg-brand text-white scale-105" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>{n}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}
