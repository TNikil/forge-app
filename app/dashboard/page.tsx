import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Header from "@/components/Header";
import { Avatar, Card, Hero, Stat } from "@/components/ui";
import Scanner from "@/components/Scanner";
import GymQR from "@/components/GymQR";
import ClaimClient from "@/components/ClaimClient";
import WeightLog from "@/components/WeightLog";
import RoutineChecklist from "@/components/RoutineChecklist";
import { lastWeights } from "@/lib/stats";

function Diet({ text }: { text: string }) {
  const rows = text.split("\n").map(l => l.trim()).filter(Boolean);
  return (
    <ul>{rows.map((l, i) => {
      const k = l.indexOf(":"), meal = k > 0 && k < 24;
      return <li key={i} className="flex gap-3 py-3 border-b border-black/5 last:border-0">
        {meal ? <><b className="w-24 shrink-0 text-brand">{l.slice(0, k)}</b><span>{l.slice(k + 1).trim()}</span></> : <span>{l}</span>}</li>;
    })}</ul>
  );
}

export default async function Dashboard() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("*").eq("id", user.id).single();
  const role = me?.role ?? "client", name = me?.full_name ?? "", first = name.split(" ")[0] || "there";
  const today = new Date().toISOString().slice(0, 10);
  let body: React.ReactNode;

  if (role === "client") {
    const { data: stats } = await sb.from("body_stats").select("logged_on,weight_kg,waist_cm").eq("client_id", user.id).order("logged_on");
    const { count } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("client_id", user.id);
    const { data: items } = await sb.from("routine_items").select("*").order("position");
    const { data: entries } = await sb.from("set_entries").select("item_id,set_no,logged_on,reps,weight_kg,routine_items(exercise_name)").eq("client_id", user.id);
    const todays = (entries ?? []).filter(e => e.logged_on === today);
    const { data: diet } = await sb.from("diet_plans").select("title,content").maybeSingle();
    const planned = (items ?? []).reduce((a, i) => a + i.sets, 0), doneToday = todays.length;
    body = (<>
      <Hero ghost="TRAIN" title={`Let's train, ${first}`} sub="Scan in at the gym, tick off your sets, log your numbers.">
        <div className="grid grid-cols-2 gap-3 max-w-md mb-6"><Stat label="Gym visits" value={count ?? 0} /><Stat label="Sets today" value={`${doneToday}/${planned}`} /></div>
        <Scanner />
      </Hero>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Today's workout" className="lg:col-span-2"><RoutineChecklist clientId={user.id} items={items ?? []} entries={todays} lastKg={lastWeights(entries ?? [])} /></Card>
        <Card title={diet?.title ?? "Diet plan"}>{diet?.content ? <Diet text={diet.content} /> : <p className="text-black/60">Your trainer hasn't added a diet plan yet.</p>}</Card>
      </div>
      <Card title="Your progress"><WeightLog clientId={user.id} initial={stats ?? []} entries={entries ?? []} /></Card>
    </>);
  } else {
    const { data: clients } = await sb.from("profiles").select("id,full_name,email").eq("role", "client").order("full_name");
    const { data: att } = await sb.from("attendance").select("client_id").eq("day", today);
    const { count: visits } = await sb.from("attendance").select("*", { count: "exact", head: true });
    const here = new Set((att ?? []).map(a => a.client_id));
    body = (<>
      <Hero ghost="CREW" title={role === "admin" ? "Run the gym" : "Your crew"} sub="Add clients, build their plans, and watch the check-ins roll in.">
        <div className="grid grid-cols-3 gap-3 max-w-xl"><Stat label="Clients" value={clients?.length ?? 0} /><Stat label="In today" value={here.size} /><Stat label="Total visits" value={visits ?? 0} /></div>
      </Hero>
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <Card title="Gym entrance QR" dark><GymQR /></Card>
        <div className="lg:col-span-2 space-y-4">
          <Card title="Add a client"><ClaimClient /></Card>
          <Card title="Clients">
            {clients?.length ? (
              <ul>{clients.map(c => (
                <li key={c.id}><Link href={`/dashboard/client/${c.id}`} className="flex items-center gap-3 py-3 border-b border-black/5 last:border-0 hover:bg-paper -mx-3 px-3 rounded-2xl">
                  <Avatar name={c.full_name} /><span className="flex-1 min-w-0"><b className="block truncate">{c.full_name}</b><span className="block truncate text-sm text-black/50">{c.email}</span></span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${here.has(c.id) ? "bg-brand text-white" : "bg-black/5 text-black/50"}`}>{here.has(c.id) ? "In today" : "Not in yet"}</span>
                </Link></li>))}</ul>
            ) : <p className="text-black/60">No clients yet. Add one using the email they signed up with.</p>}
          </Card>
        </div>
      </div>
    </>);
  }
  return (<main className="max-w-5xl mx-auto p-3 sm:p-6"><Header name={name} role={role} /><div className="space-y-4">{body}</div></main>);
}
