"use client";
import { useEffect, useState } from "react";
export default function InstallButton() {
  const [ev, setEv] = useState<any>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEv(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  if (!ev) return null;
  return <button onClick={() => { ev.prompt(); setEv(null); }} className="rounded-full bg-brand px-3 py-1.5 font-semibold">Install app</button>;
}
