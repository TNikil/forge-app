type E = { item_id?: string; logged_on: string; reps: number; weight_kg: number | string; routine_items?: any };
const nm = (e: any) => (Array.isArray(e.routine_items) ? e.routine_items[0] : e.routine_items)?.exercise_name ?? "Exercise";
function byDay(e: E[], f: (x: E) => number, key: string): any[] {
  const m: Record<string, number> = {};
  e.forEach(x => { m[x.logged_on] = (m[x.logged_on] ?? 0) + f(x); });
  return Object.entries(m).sort(([a], [b]) => (a < b ? -1 : 1)).map(([day, v]) => ({ day, [key]: Math.round(v) }));
}
export const repsByDay = (e: E[]) => byDay(e, x => x.reps, "reps");
export const volumeByDay = (e: E[]) => byDay(e, x => x.reps * Number(x.weight_kg), "volume");
export function records(e: E[]) {
  const m = new Map<string, { name: string; kg: number; reps: number }>();
  e.forEach(x => {
    const n = nm(x), kg = Number(x.weight_kg), c = m.get(n);
    if (kg > 0 && (!c || kg > c.kg || (kg === c.kg && x.reps > c.reps))) m.set(n, { name: n, kg, reps: x.reps });
  });
  return [...m.values()].sort((a, b) => b.kg - a.kg).slice(0, 6);
}
export function lastWeights(e: E[]) {
  const m: Record<string, number> = {};
  [...e].sort((a, b) => (a.logged_on < b.logged_on ? 1 : -1)).forEach(x => { if (x.item_id && !(x.item_id in m)) m[x.item_id] = Number(x.weight_kg); });
  return m;
}
