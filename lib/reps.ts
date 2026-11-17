export function repsByDay(rows: any[]) {
  const m: Record<string, number> = {};
  for (const r of rows ?? []) {
    const it = Array.isArray(r.routine_items) ? r.routine_items[0] : r.routine_items;
    m[r.logged_on] = (m[r.logged_on] ?? 0) + r.sets_done * (it?.reps ?? 0);
  }
  return Object.entries(m).sort(([a], [b]) => (a < b ? -1 : 1)).map(([day, reps]) => ({ day, reps }));
}
