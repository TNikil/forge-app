import "./globals.css";
import type { Viewport } from "next";
import { BRAND } from "@/lib/brand";
import PWARegister from "@/components/PWARegister";
export const metadata = {
  title: `${BRAND} · Train. Track. Check in.`, description: "Personal training app for trainers and clients.",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: BRAND, statusBarStyle: "default" as const },
};
export const viewport: Viewport = { themeColor: "#ff5a1f", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}<PWARegister /></body></html>);
}
