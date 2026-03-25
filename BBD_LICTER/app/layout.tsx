import type { Metadata } from "next";
import "./globals.css";

import "@fontsource/bricolage-grotesque/latin.css";
import "@fontsource/bricolage-grotesque/latin-700.css";
import "@fontsource/bricolage-grotesque/latin-800.css";
import "@fontsource/dm-sans/latin.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/jetbrains-mono/latin.css";
import "@fontsource/jetbrains-mono/latin-600.css";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BackgroundFX } from "@/components/layout/BackgroundFX";

export const metadata: Metadata = {
  title: "SEPHORA Intel — Intelligence COMEX",
  description: "Dashboard Brand & Market Intelligence — Sephora vs Nocibé",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 licter-mesh opacity-80" />
        <BackgroundFX />

        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="min-w-0 flex-1 bg-[#FDFDFD] px-6 pb-10 pt-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
