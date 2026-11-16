import Link from "next/link";
import { BRAND } from "@/lib/brand";
export default function Home() {
  return (
    <main className="p-3 sm:p-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-brand-deep text-white min-h-[88vh] flex flex-col justify-between p-6 sm:p-12">
        <span aria-hidden className="display absolute -top-2 left-4 text-[28vw] text-white/10 select-none">Fitness</span>
        <header className="relative flex items-center justify-between font-extrabold text-xl">
          <span>⚡ {BRAND}</span>
          <Link href="/login" className="btn bg-white/15 backdrop-blur">Log in</Link>
        </header>
        <div className="relative max-w-3xl">
          <h1 className="display text-5xl sm:text-8xl">Stronger habits.<br />Brighter tomorrow.</h1>
          <p className="mt-6 max-w-md text-white/85">Trainers build the plan. Clients tick off every set, log their body stats and scan in at the gym door.</p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link href="/login" className="btn bg-white text-ink">Start your journey</Link>
            <Link href="/login" className="btn border border-white/60">I'm a trainer</Link>
          </div>
        </div>
        <ul className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-white/85">
          {["Client profiles","Workout routines","Progress charts","QR check-in"].map(t => <li key={t} className="border-t border-white/30 pt-3 font-semibold">{t}</li>)}
        </ul>
      </section>
    </main>
  );
}
