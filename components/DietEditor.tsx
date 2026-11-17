"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function DietEditor({ clientId, trainerId, initial }: { clientId: string; trainerId: string; initial: { title: string; content: string } | null }) {
  const [title, setTitle] = useState(initial?.title ?? "Diet plan"); const [content, setContent] = useState(initial?.content ?? ""); const [msg, setMsg] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabaseBrowser().from("diet_plans").upsert(
      { client_id: clientId, trainer_id: trainerId, title, content, updated_at: new Date().toISOString() }, { onConflict: "client_id" });
    setMsg(error ? error.message : "Saved.");
  }
  return (
    <form onSubmit={save} className="space-y-3">
      <input className="w-full rounded-full border border-black/15 bg-white px-4 py-3" value={title} onChange={e => setTitle(e.target.value)} aria-label="Plan title" />
      <textarea className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 min-h-48" value={content} onChange={e => setContent(e.target.value)}
        placeholder={"Breakfast: oats, eggs, banana\nLunch: rice, chicken, greens\nDinner: ...\nSnacks / water / notes"} />
      <button className="btn bg-ink text-white">Save diet plan</button>
      {msg && <span role="status" className="ml-3 text-sm text-black/60">{msg}</span>}
    </form>
  );
}
