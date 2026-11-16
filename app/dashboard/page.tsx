import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { BRAND } from "@/lib/brand";
import Scanner from "@/components/Scanner";
import GymQR from "@/components/GymQR";
import ClaimClient from "@/components/ClaimClient";
import WeightLog from "@/components/WeightLog";

function Card({ title, dark, wide, children }: { title: string; dark?: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-[1.75rem] p-6 ${wide ? "md:col-span-2" : ""} ${dark ? "bg-ink text-white" : "bg-white"}`}>
      <h2 className="font-bold text-lg mb-4">{title}</h2>{children}
    </section>
  );
}

export default async function Dashboard() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await sb.from("profiles").select("*").eq("id", user.id).single();
  const role = me?.role ?? "client";
  const today = new Date().toISOString().slice(0, 10);
  let body: React.ReactNode;

  if (role === "client") {
    const { data: stats } = await sb.from("body_stats").select("logged_on,weight_kg").eq("client_id", user.id).order("logged_on");
    const { count } = await sb.from("attendance").select("*", { count: "exact", head: true }).eq("client_id", user.id);
    body = (<>
      <Card title="Check in" dark><Scanner /></Card>
      <Card title="Gym visits"><p className="display text-7xl text-brand">{count ?? 0}</p></Card>
      <Card title="Your progress" wide><WeightLog clientId={user.id} initial={stats ?? []} /></Card>
    </>);
  } else {
    const { data: clients } = await sb.from("profiles").select("id,full_name,email").eq("role", "client").order("full_name");
    const { data: att } = await sb.from("attendance").select("client_id").eq("day", today);
    const here = new Set((att ?? []).map(a => a.client_id));
    body = (<>
      <Card title="Gym entrance QR" dark><GymQR /></Card>
      <Card title="Add a client"><ClaimClient />
        <p className="mt-4 text-sm text-black/60">{here.size} checked in today</p></Card>
      <Card title={`Clients (${clients?.length ?? 0})`} wide>
        {clients?.length ? (
          <ul className="divide-y divide-black/10">
            {clients.map(c => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <span><b>{c.full_name}</b> <span className="text-black/50 text-sm">{c.email}</span></span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${here.has(c.id) ? "bg-brand text-white" : "bg-black/5 text-black/50"}`}>
                  {here.has(c.id) ? "In today" : "Not in yet"}
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="text-black/60">No clients yet. Add one using the email they signed up with.</p>}
      </Card>
    </>);
  }

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-8">
      <header className="flex items-center justify-between rounded-full bg-gradient-to-r from-brand to-brand-deep text-white px-6 py-3 mb-6">
        <span className="font-extrabold">⚡ {BRAND}</span>
        <span className="flex items-center gap-3 text-sm">
          {me?.full_name} · {role}
          <form action="/auth/signout" method="post"><button className="underline">Log out</button></form>
        </span>
      </header>
      <h1 className="display text-4xl sm:text-6xl mb-6">{role === "client" ? "Let's train" : "Your crew"}</h1>
      <div className="grid md:grid-cols-2 gap-4">{body}</div>
    </main>
  );
}
