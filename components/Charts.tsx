"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { records, repsByDay, volumeByDay } from "@/lib/stats";
const tick = { fontSize: 12, fill: "#8a8a8a" };
const tip = { contentStyle: { borderRadius: 16, border: "none", boxShadow: "0 8px 30px rgba(0,0,0,.12)" } };
const md = (d: string) => d.slice(5);
const Empty = ({ t }: { t: string }) => <p className="text-black/50 py-10">{t}</p>;
export function BarsChart({ data, xKey, yKey, empty }: { data: any[]; xKey: string; yKey: string; empty: string }) {
  if (!data.length) return <Empty t={empty} />;
  return (
    <div className="h-52"><ResponsiveContainer><BarChart data={data}>
      <CartesianGrid vertical={false} stroke="#eee" />
      <XAxis dataKey={xKey} tickFormatter={md} tick={tick} axisLine={false} tickLine={false} />
      <YAxis tick={tick} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
      <Tooltip {...tip} cursor={{ fill: "rgba(255,90,31,.08)" }} />
      <Bar dataKey={yKey} fill="#ff5a1f" radius={[8, 8, 0, 0]} />
    </BarChart></ResponsiveContainer></div>
  );
}
function Trend({ data, yKey, empty }: { data: any[]; yKey: string; empty: string }) {
  if (!data.length) return <Empty t={empty} />;
  return (
    <div className="h-52"><ResponsiveContainer><AreaChart data={data}>
      <defs><linearGradient id={`g-${yKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff5a1f" stopOpacity={0.35} /><stop offset="100%" stopColor="#ff5a1f" stopOpacity={0} /></linearGradient></defs>
      <CartesianGrid vertical={false} stroke="#eee" />
      <XAxis dataKey="logged_on" tickFormatter={md} tick={tick} axisLine={false} tickLine={false} />
      <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={tick} axisLine={false} tickLine={false} width={36} />
      <Tooltip {...tip} />
      <Area type="monotone" dataKey={yKey} stroke="#ff5a1f" strokeWidth={3} fill={`url(#g-${yKey})`} dot={{ r: 3, fill: "#ff5a1f" }} />
    </AreaChart></ResponsiveContainer></div>
  );
}
export default function ProgressCharts({ stats, entries }: { stats: any[]; entries: any[] }) {
  const w = stats.filter(s => s.weight_kg != null), c = stats.filter(s => s.waist_cm != null), prs = records(entries);
  return (
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
      <div><h3 className="font-bold mb-2">Weight (kg)</h3><Trend data={w} yKey="weight_kg" empty="Log your weight to start this chart." /></div>
      <div><h3 className="font-bold mb-2">Reps completed</h3><BarsChart data={repsByDay(entries)} xKey="day" yKey="reps" empty="Save a set with its reps to see this." /></div>
      <div><h3 className="font-bold mb-2">Volume lifted (kg)</h3><BarsChart data={volumeByDay(entries)} xKey="day" yKey="volume" empty="Reps × weight shows up here." /></div>
      {c.length > 0 && <div><h3 className="font-bold mb-2">Waist (cm)</h3><Trend data={c} yKey="waist_cm" empty="" /></div>}
      {prs.length > 0 && (
        <div className="md:col-span-2"><h3 className="font-bold mb-3">Personal records</h3>
          <ul className="grid sm:grid-cols-3 gap-3">{prs.map(p => (
            <li key={p.name} className="rounded-2xl bg-ink text-white p-4">
              <p className="text-sm text-white/60 truncate">{p.name}</p>
              <p className="display text-3xl text-brand">{p.kg}<span className="text-base text-white ml-1">kg</span></p>
              <p className="text-sm text-white/60">× {p.reps} reps</p>
            </li>))}</ul></div>
      )}
    </div>
  );
}
