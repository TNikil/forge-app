"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { BRAND } from "@/lib/brand";
export default function Login() {
  const sb = supabaseBrowser();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const { error } = mode === "in"
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: location.origin + "/auth/callback" } });
    if (error) return setMsg(error.message);
    if (mode === "in") location.href = "/dashboard"; else setMsg("Check your email to confirm your account.");
  }
  const input = "w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/50";
  return (
    <main className="min-h-screen grid place-items-center p-4 bg-ink">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[2rem] bg-gradient-to-br from-brand to-brand-deep p-7 text-white space-y-3">
        <p className="font-extrabold text-xl">⚡ {BRAND}</p>
        <h1 className="display text-4xl pb-2">{mode === "in" ? "Welcome back" : "Join the crew"}</h1>
        {mode === "up" && <input className={input} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />}
        <input className={input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn w-full justify-center bg-white text-ink">{mode === "in" ? "Log in" : "Create account"}</button>
        <button type="button" className="btn w-full justify-center border border-white/60"
          onClick={() => sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + "/auth/callback" } })}>Continue with Google</button>
        {msg && <p role="alert" className="text-sm bg-black/30 rounded-xl p-3">{msg}</p>}
        <button type="button" className="text-sm underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "New here? Create an account" : "Have an account? Log in"}
        </button>
      </form>
    </main>
  );
}
