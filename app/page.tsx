import Link from "next/link";
import { BRAND } from "@/lib/brand";

const features = [
  ["01", "Client profiles", "Every client in one place, linked to their trainer."],
  ["02", "Workout routines", "Custom plans with photos, video and diet charts."],
  ["03", "Progress charts", "Weight, reps and measurements, always up to date."],
  ["04", "QR check-in", "Scan at the door. Attendance logs itself."],
];
const steps = [
  ["Build", "Trainers create a plan for each client: exercises, sets, reps and a diet chart."],
  ["Train", "Clients open the app at the gym and tick off every set as they go."],
  ["Track", "Scan the entrance QR, log body stats, and watch the charts climb."],
];

export default function Home() {
  return (
    <main className="p-3 sm:p-5 space-y-3">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-brand-deep text-white min-h-[94vh] flex flex-col p-6 sm:p-12">
        <span aria-hidden className="display pointer-events-none select-none absolute inset-x-0 bottom-[-1vw] text-center whitespace-nowrap text-[17vw] text-white/[0.07]">Fitness</span>

        <header className="relative flex items-center justify-between">
          <span className="font-extrabold text-xl"><span className="text-white/70">⚡</span> {BRAND}</span>
          <Link href="/login" className="btn border border-white/40 hover:bg-white/10">Log in</Link>
        </header>

        <div className="relative flex-1 flex flex-col justify-center py-14 sm:py-20">
          <h1 className="display text-5xl sm:text-7xl lg:text-8xl max-w-4xl">Stronger habits.<br />Brighter tomorrow.</h1>
          <p className="mt-8 max-w-lg text-lg text-white/85 leading-relaxed">
            Trainers build the plan. Clients tick off every set, log their body stats and scan in at the gym door.
          </p>
          <div className="mt-10 flex gap-3 flex-wrap">
            <Link href="/login" className="btn bg-white text-ink px-7 py-4">Start your journey</Link>
            <Link href="/login" className="btn border border-white/50 px-7 py-4 hover:bg-white/10">I’m a trainer</Link>
          </div>
        </div>

        <ul className="relative grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-3xl bg-white/20">
          {features.map(([n, t, d]) => (
            <li key={n} className="bg-black/20 backdrop-blur-sm p-5 sm:p-6">
              <span className="text-xs font-bold tracking-widest text-white/50">{n}</span>
              <p className="mt-3 font-bold text-lg leading-tight">{t}</p>
              <p className="mt-1.5 text-sm text-white/65 leading-snug">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[2rem] bg-ink text-white p-8 sm:p-14">
        <p className="text-sm font-bold tracking-widest text-brand">HOW IT WORKS</p>
        <h2 className="display mt-3 text-4xl sm:text-6xl max-w-2xl">One plan. Every session. Real results.</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="border-t border-white/15 pt-6">
              <span className="display text-6xl text-brand">{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-white/60 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex items-center justify-between gap-4 flex-wrap border-t border-white/15 pt-8">
          <span className="font-extrabold text-lg"><span className="text-brand">⚡</span> {BRAND}</span>
          <Link href="/login" className="btn bg-brand text-white px-7 py-4">Get started</Link>
        </div>
      </section>
    </main>
  );
}
