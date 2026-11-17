import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Avatar } from "./ui";
export default function Header({ name, role }: { name: string; role: string }) {
  return (
    <header className="sticky top-3 z-20 mb-5 flex items-center justify-between rounded-full bg-ink text-white py-2.5 pl-6 pr-3">
      <Link href="/dashboard" className="font-extrabold text-lg"><span className="text-brand">⚡</span> {BRAND}</Link>
      <nav className="flex items-center gap-3 text-sm">
        {role === "admin" && <Link href="/dashboard/admin" className="hover:text-brand">Admin</Link>}
        <span className="hidden sm:block text-white/60">{name} · {role}</span>
        <Avatar name={name} size={36} />
        <form action="/auth/signout" method="post"><button className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">Log out</button></form>
      </nav>
    </header>
  );
}
