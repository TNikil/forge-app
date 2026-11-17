export function Card({ title, dark, className = "", children }: { title?: string; dark?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-[2rem] p-6 sm:p-7 ${dark ? "bg-ink text-white" : "bg-white"} ${className}`}>
      {title && <h2 className="font-extrabold text-xl tracking-tight mb-5">{title}</h2>}
      {children}
    </section>
  );
}
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span style={{ width: size, height: size }} className="grid place-items-center shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-deep text-white font-extrabold">
      {(name || "?").trim()[0]?.toUpperCase()}
    </span>
  );
}
export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="display text-4xl sm:text-5xl">{value}</p>
      <p className="text-sm text-white/80 mt-1">{label}</p>
    </div>
  );
}
export function Hero({ ghost, title, sub, children }: { ghost: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-brand-deep text-white p-6 sm:p-10">
      <span aria-hidden className="display absolute -top-3 right-2 text-[26vw] sm:text-[11rem] text-white/10 select-none pointer-events-none">{ghost}</span>
      <div className="relative">
        <h1 className="display text-4xl sm:text-7xl max-w-2xl">{title}</h1>
        {sub && <p className="mt-3 text-white/85 max-w-md">{sub}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
