import "./globals.css";
import { BRAND } from "@/lib/brand";
export const metadata = { title: `${BRAND} · Train. Track. Check in.`, description: "Personal training app for trainers and clients." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body>{children}</body></html>);
}
