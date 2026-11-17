import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import RoutineBuilder from "@/components/RoutineBuilder";
import DietEditor from "@/components/DietEditor";

export default async function ClientPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (!me || me.role === "client") redirect("/dashboard");
  const { data: client } = await sb.from("profiles").select("id,full_name,email").eq("id", params.id).single();
  if (!client) redirect("/dashboard");
  const { data: routine } = await sb.from("routines").select("id").eq("client_id", client.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: items } = routine ? await sb.from("routine_items").select("*").eq("routine_id", routine.id).order("position") : { data: [] as any[] };
  const { data: diet } = await sb.from("diet_plans").select("title,content").eq("client_id", client.id).maybeSingle();
  const { data: stats } = await sb.from("body_stats").select("logged_on,weight_kg,waist_cm").eq("client_id", client.id).order("logged_on", { ascending: false }).limit(5);
  const { count } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("client_id", client.id);
  const box = "rounded-[1.75rem] bg-white p-6";
  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-4">
      <Link href="/dashboard" className="text-sm underline">Back to clients</Link>
      <h1 className="display text-4xl sm:text-5xl">{client.full_name}</h1>
      <p className="text-black/60">{client.email} · {count ?? 0} gym visits</p>
      <section className={box}><h2 className="font-bold text-lg mb-4">Workout routine</h2>
        <RoutineBuilder clientId={client.id} trainerId={user.id} routineId={routine?.id ?? null} items={items ?? []} /></section>
      <section className={box}><h2 className="font-bold text-lg mb-4">Diet plan</h2>
        <DietEditor clientId={client.id} trainerId={user.id} initial={diet} /></section>
      <section className={box}><h2 className="font-bold text-lg mb-3">Recent check-ins</h2>
        {stats?.length ? <ul className="divide-y divide-black/10">{stats.map(s => <li key={s.logged_on} className="py-2 flex justify-between"><span>{s.logged_on}</span><span>{s.weight_kg} kg{s.waist_cm ? ` · waist ${s.waist_cm} cm` : ""}</span></li>)}</ul>
          : <p className="text-black/60">No weight entries yet.</p>}</section>
    </main>
  );
}
