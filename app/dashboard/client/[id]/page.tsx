import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Header from "@/components/Header";
import { Avatar, Card } from "@/components/ui";
import ProgressCharts from "@/components/Charts";
import RoutineBuilder from "@/components/RoutineBuilder";
import DietEditor from "@/components/DietEditor";
import { repsByDay } from "@/lib/reps";

export default async function ClientPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("role,full_name").eq("id", user.id).single();
  if (!me || me.role === "client") redirect("/dashboard");
  const { data: client } = await sb.from("profiles").select("id,full_name,email").eq("id", params.id).single();
  if (!client) redirect("/dashboard");
  const { data: routine } = await sb.from("routines").select("id").eq("client_id", client.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: items } = routine ? await sb.from("routine_items").select("*").eq("routine_id", routine.id).order("position") : { data: [] as any[] };
  const { data: diet } = await sb.from("diet_plans").select("title,content").eq("client_id", client.id).maybeSingle();
  const { data: stats } = await sb.from("body_stats").select("logged_on,weight_kg,waist_cm").eq("client_id", client.id).order("logged_on");
  const { data: logs } = await sb.from("set_logs").select("logged_on,sets_done,routine_items(reps)").eq("client_id", client.id);
  const { count } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("client_id", client.id);
  return (
    <main className="max-w-4xl mx-auto p-3 sm:p-6">
      <Header name={me.full_name} role={me.role} />
      <div className="space-y-4">
        <Link href="/dashboard" className="inline-block text-sm font-semibold underline">Back to clients</Link>
        <section className="flex items-center gap-4 rounded-[2rem] bg-gradient-to-br from-brand to-brand-deep p-6 sm:p-8 text-white">
          <Avatar name={client.full_name} size={72} />
          <div className="min-w-0"><h1 className="display text-3xl sm:text-5xl truncate">{client.full_name}</h1><p className="text-white/80 truncate">{client.email} · {count ?? 0} gym visits</p></div>
        </section>
        <Card title="Progress"><ProgressCharts stats={stats ?? []} reps={repsByDay(logs ?? [])} /></Card>
        <Card title="Workout routine"><RoutineBuilder clientId={client.id} trainerId={user.id} routineId={routine?.id ?? null} items={items ?? []} /></Card>
        <Card title="Diet plan"><DietEditor clientId={client.id} trainerId={user.id} initial={diet} /></Card>
      </div>
    </main>
  );
}
