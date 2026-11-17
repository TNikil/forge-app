import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Header from "@/components/Header";
import { Avatar, Card, Hero, Stat } from "@/components/ui";
import { BarsChart } from "@/components/Charts";
import RoleSelect from "@/components/RoleSelect";

const ago = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

export default async function Admin() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("role,full_name").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");
  const count = async (role: string) => (await sb.from("profiles").select("*", { count: "exact", head: true }).eq("role", role)).count ?? 0;
  const [clients, trainers, today, week, sets, recent, people] = await Promise.all([
    count("client"), count("trainer"),
    sb.from("attendance").select("*", { count: "exact", head: true }).eq("day", ago(0)),
    sb.from("attendance").select("*", { count: "exact", head: true }).gte("day", ago(6)),
    sb.from("set_entries").select("*", { count: "exact", head: true }).gte("logged_on", ago(6)),
    sb.from("attendance").select("day").gte("day", ago(13)),
    sb.from("profiles").select("id,full_name,email,role").order("created_at", { ascending: false }),
  ]);
  const perDay: Record<string, number> = {};
  (recent.data ?? []).forEach(r => { perDay[r.day] = (perDay[r.day] ?? 0) + 1; });
  const series = Array.from({ length: 14 }, (_, i) => ago(13 - i)).map(day => ({ day, checkins: perDay[day] ?? 0 }));
  return (
    <main className="max-w-5xl mx-auto p-3 sm:p-6">
      <Header name={me.full_name} role="admin" />
      <div className="space-y-4">
        <Hero ghost="ADMIN" title="Gym overview" sub="Usage across the whole app, and who has access to what.">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Stat label="Clients" value={clients} /><Stat label="Trainers" value={trainers} />
            <Stat label="Check-ins today" value={today.count ?? 0} /><Stat label="Check-ins, 7 days" value={week.count ?? 0} />
          </div>
          <a href="/api/attendance" className="btn bg-white text-ink">Export attendance CSV</a>
          <span className="ml-3 text-sm text-white/80">{sets.count ?? 0} sets logged this week</span>
        </Hero>
        <Card title="Check-ins, last 14 days"><BarsChart data={series} xKey="day" yKey="checkins" empty="No check-ins yet." /></Card>
        <Card title="People">
          <ul>{(people.data ?? []).map(p => (
            <li key={p.id} className="flex items-center gap-3 py-3 border-b border-black/5 last:border-0">
              <Avatar name={p.full_name} /><span className="flex-1 min-w-0"><b className="block truncate">{p.full_name}</b><span className="block truncate text-sm text-black/50">{p.email}</span></span>
              <RoleSelect id={p.id} role={p.role} self={p.id === user.id} />
            </li>))}</ul>
        </Card>
      </div>
    </main>
  );
}
