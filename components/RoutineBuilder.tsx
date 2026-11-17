"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import Media from "./Media";
type Item = { id: string; exercise_name: string; sets: number; reps: number; notes: string | null; media_url: string | null };
export default function RoutineBuilder({ clientId, trainerId, routineId, items }: { clientId: string; trainerId: string; routineId: string | null; items: Item[] }) {
  const sb = supabaseBrowser(); const router = useRouter();
  const [f, setF] = useState({ name: "", sets: "3", reps: "10", notes: "" });
  const [file, setFile] = useState<File | null>(null); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const fail = (m: string) => { setBusy(false); setMsg(m); };
    let rid = routineId;
    if (!rid) {
      const { data, error } = await sb.from("routines").insert({ trainer_id: trainerId, client_id: clientId }).select("id").single();
      if (error) return fail(error.message); rid = data.id;
    }
    let media_url: string | null = null;
    if (file) {
      const path = `${clientId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("exercise-media").upload(path, file);
      if (error) return fail(error.message);
      media_url = sb.storage.from("exercise-media").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await sb.from("routine_items").insert({ routine_id: rid, position: items.length, exercise_name: f.name, sets: +f.sets, reps: +f.reps, notes: f.notes || null, media_url });
    if (error) return fail(error.message);
    setBusy(false); setF({ ...f, name: "", notes: "" }); setFile(null); router.refresh();
  }
  async function remove(id: string) { await sb.from("routine_items").delete().eq("id", id); router.refresh(); }
  const inp = "rounded-full border border-black/15 bg-white px-4 py-3";
  return (
    <div>
      <ul className="space-y-3 mb-5">
        {items.map(it => (
          <li key={it.id} className="rounded-2xl border border-black/10 p-3 flex gap-3 items-center">
            <div className="flex-1"><b>{it.exercise_name}</b> <span className="text-sm text-black/50">{it.sets} × {it.reps}</span>{it.notes && <p className="text-sm text-black/60">{it.notes}</p>}</div>
            {it.media_url && <div className="w-24"><Media url={it.media_url} /></div>}
            <button onClick={() => remove(it.id)} className="text-sm underline text-black/50">Remove</button>
          </li>
        ))}
        {!items.length && <li className="text-black/60">No exercises yet. Add the first one below.</li>}
      </ul>
      <form onSubmit={add} className="flex gap-2 flex-wrap items-center">
        <input className={`${inp} flex-1 min-w-40`} required placeholder="Exercise (e.g. Back squat)" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <input className={`${inp} w-24`} type="number" min={1} required aria-label="Sets" placeholder="Sets" value={f.sets} onChange={e => setF({ ...f, sets: e.target.value })} />
        <input className={`${inp} w-24`} type="number" min={1} required aria-label="Reps" placeholder="Reps" value={f.reps} onChange={e => setF({ ...f, reps: e.target.value })} />
        <input className={`${inp} w-full`} placeholder="Notes (tempo, rest, cues)" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} />
        <input key={items.length} type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        <button disabled={busy} className="btn bg-brand text-white">{busy ? "Adding…" : "Add exercise"}</button>
        {msg && <p role="alert" className="w-full text-sm text-red-600">{msg}</p>}
      </form>
    </div>
  );
}
