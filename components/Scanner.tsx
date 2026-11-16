"use client";
import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function Scanner() {
  const [on, setOn] = useState(false); const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!on) return;
    const q = new Html5Qrcode("reader");
    q.start({ facingMode: "environment" }, { fps: 10, qrbox: 240 }, async (text) => {
      await q.stop().catch(() => {}); setOn(false);
      const { error } = await supabaseBrowser().rpc("check_in", { p_token: text });
      setMsg(error ? error.message : "You're checked in. Have a great session.");
    }, () => {}).catch(() => { setOn(false); setMsg("Camera blocked. Allow camera access and try again."); });
    return () => { if (q.isScanning) q.stop().catch(() => {}); };
  }, [on]);
  return (
    <div>
      {on && <div id="reader" className="overflow-hidden rounded-2xl mb-3" />}
      <button onClick={() => { setMsg(""); setOn(!on); }} className="btn bg-brand text-white">{on ? "Cancel" : "Scan gym QR"}</button>
      {msg && <p role="status" className="mt-3 text-sm text-white/80">{msg}</p>}
    </div>
  );
}
