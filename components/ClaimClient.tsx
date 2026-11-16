"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function ClaimClient() {
  const [email, setEmail] = useState(""); const [msg, setMsg] = useState(""); const router = useRouter();
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabaseBrowser().rpc("claim_client", { p_email: email });
    setMsg(error ? error.message : "Client added."); if (!error) { setEmail(""); router.refresh(); }
  }
  return (
    <form onSubmit={add} className="flex gap-2 flex-wrap">
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Client's sign-up email"
        className="flex-1 min-w-48 rounded-full border border-black/15 bg-white px-4 py-3" />
      <button className="btn bg-ink text-white">Add client</button>
      {msg && <p role="status" className="w-full text-sm text-black/60">{msg}</p>}
    </form>
  );
}
