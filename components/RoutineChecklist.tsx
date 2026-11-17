"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Media from "./Media";
type Item = { id: string; exercise_name: string; sets: number; reps: number; notes: string | null; media_url: string | null };
type Entry = { item_id: string; set_no: number; reps: number; weight_kg: number | string };
type M = Record<string, { reps: number; kg: number }>;
const today = () => new Date().toISOString().slice(0, 10);
const box = "w-24 rounded-full bg-white/10 px-4 py-2.5 text-white placeholder:text-white/40";
export default function RoutineChecklist({ clientId, items, entries, lastKg }: { clientId: string; items: Item[]; entries: Entry[]; lastKg: Record<string, number> }) {
  const sb = supabaseBrowser();
  const [map, setMap] = useState<M>(Object.fromEntries(entries.map(e => [`${e.item_id}:${e.set_no}`, { reps: e.reps, kg: Number(e.weight_kg) }])));
  const [open, setOpen] = useState<{ id: string; n: number } | null>(null);
  const [reps, setReps] = useState(""); const [kg, setKg] = useState(""); const [err, setErr] = useState("");
  const count = (m: M, it: Item) => Array.from({ length: it.sets }, (_, i) => i + 1).filter(n => m[`${it.id}:${n}`]).length;
  function pick(it: Item, n: number) {
    if (open?.id === it.id && open.n === n) return setOpen(null);
    const ex = map[`${it.id}:${n}`], prev = map[`${it.id}:${n - 1}`];
    setOpen({ id: it.id, n }); setErr(""); setReps(String(ex?.reps ?? it.reps)); setKg(String(ex?.kg ?? prev?.kg ?? lastKg[it.id] ?? ""));
  }
  async function sync(it: Item, m: M) {
    const { error } = await sb.from("set_logs").upsert({ item_id: it.id, client_id: clientId, logged_on: today(), sets_done: count(m, it) }, { onConflict: "item_id,client_id,logged_on" });
    if (error) setErr(error.message);
  }
  async function save(it: Item) {
    const n = open!.n, row = { item_id: it.id, client_id: clientId, logged_on: today(), set_no: n, reps: Number(reps), weight_kg: Number(kg || 0) };
    const { error } = await sb.from("set_entries").upsert(row, { onConflict: "item_id,client_id,logged_on,set_no" });
    if (error) return setErr(error.message);
    const m = { ...map, [`${it.id}:${n}`]: { reps: row.reps, kg: row.weight_kg } }; setMap(m); setOpen(null); sync(it, m);
  }
  async function undo(it: Item) {
    const n = open!.n;
    await sb.from("set_entries").delete().eq("item_id", it.id).eq("client_id", clientId).eq("logged_on", today()).eq("set_no", n);
    const m = { ...map }; delete m[`${it.id}:${n}`]; setMap(m); setOpen(null); sync(it, m);
  }
  if (!items.length) return <p className="text-black/60">Your trainer hasn't assigned a routine yet. It will show up here.</p>;
  const total = items.reduce((a, i) => a + i.sets, 0), got = items.reduce((a, i) => a + count(map, i), 0);
  return (
    <div>
      <div className="mb-5">
        <div className="flex justify-between text-sm font-semibold mb-2"><span>{got === total ? "Workout complete. Great work." : "Today's progress"}</span><span>{got}/{total} sets</span></div>
        <div className="h-3 rounded-full bg-black/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all" style={{ width: `${total ? (got / total) * 100 : 0}%` }} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 items-start">
        {items.map(it => {
          const c = count(map, it), isOpen = open?.id === it.id;
          return (
            <div key={it.id} className={`rounded-3xl bg-ink text-white p-5 ${c >= it.sets ? "ring-2 ring-brand" : ""}`}>
              {it.media_url && <div className="mb-4"><Media url={it.media_url} /></div>}
              <div className="flex items-start justify-between gap-3">
                <h3 className="display text-2xl">{it.exercise_name}</h3>
                <span className="rounded-full bg-brand px-3 py-1 text-sm font-bold whitespace-nowrap">{it.sets} × {it.reps}</span>
              </div>
              {it.notes && <p className="mt-2 text-sm text-white/60">{it.notes}</p>}
              <div className="mt-4 flex gap-2 flex-wrap">
                {Array.from({ length: it.sets }, (_, i) => i + 1).map(n => {
                  const done = !!map[`${it.id}:${n}`], sel = isOpen && open!.n === n;
                  return <button key={n} onClick={() => pick(it, n)} aria-label={`Set ${n}`} aria-pressed={done}
                    className={`size-12 rounded-full font-extrabold transition ${done ? "bg-brand text-white" : "bg-white/10 text-white/60 hover:bg-white/20"} ${sel ? "ring-2 ring-white" : ""}`}>{n}</button>;
                })}
              </div>
              {isOpen && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-white/5 p-3">
                  <span className="text-sm text-white/60">Set {open!.n}</span>
                  <input className={box} type="number" inputMode="numeric" min={0} value={reps} onChange={e => setReps(e.target.value)} placeholder="Reps" aria-label="Reps" />
                  <input className={box} type="number" inputMode="decimal" step="0.5" min={0} value={kg} onChange={e => setKg(e.target.value)} placeholder="kg" aria-label="Weight in kg" />
                  <button onClick={() => save(it)} disabled={!reps} className="btn bg-brand text-white py-2.5">Save set</button>
                  {map[`${it.id}:${open!.n}`] && <button onClick={() => undo(it)} className="text-sm underline text-white/60">Undo</button>}
                </div>
              )}
              {c > 0 && <p className="mt-3 text-xs text-white/50">{Array.from({ length: it.sets }, (_, i) => i + 1).filter(n => map[`${it.id}:${n}`]).map(n => `${map[`${it.id}:${n}`].reps}×${map[`${it.id}:${n}`].kg}kg`).join("  ·  ")}</p>}
            </div>
          );
        })}
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}
