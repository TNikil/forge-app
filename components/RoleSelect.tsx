"use client";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function RoleSelect({ id, role, self }: { id: string; role: string; self: boolean }) {
  const router = useRouter();
  async function change(e: React.ChangeEvent<HTMLSelectElement>) {
    await supabaseBrowser().from("profiles").update({ role: e.target.value }).eq("id", id); router.refresh();
  }
  return (
    <select disabled={self} defaultValue={role} onChange={change} aria-label="Role" title={self ? "You can't change your own role" : ""}
      className="rounded-full border border-black/15 bg-white px-3 py-2 text-sm disabled:opacity-50">
      <option value="client">Client</option><option value="trainer">Trainer</option><option value="admin">Admin</option>
    </select>
  );
}
