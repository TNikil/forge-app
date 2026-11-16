"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function GymQR() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { supabaseBrowser().rpc("get_gym_token").then(({ data }) => setToken(data)); }, []);
  return (
    <div className="grid place-items-center gap-3">
      <div className="rounded-2xl bg-white p-4">{token ? <QRCodeSVG value={token} size={180} /> : <div className="size-[180px]" />}</div>
      <p className="text-sm text-white/70 text-center">Show this at the entrance. It changes every day.</p>
    </div>
  );
}
