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
import { PageTransition } from "@/components/layout/PageTransition";
import { MistralChatAgent } from "@/components/ai/MistralChatAgent";

export const metadata: Metadata = {
  title: "SEPHORA Intel — Intelligence Stratégique",
  description: "Dashboard Brand & Market Intelligence — Sephora vs Nocibé",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 licter-mesh opacity-80" />
        <BackgroundFX />

        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main id="pdf-capture-area" className="min-h-0 min-w-0 flex-1 overflow-auto px-4 py-6 md:px-8">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>

        <MistralChatAgent />
      </body>
    </html>
  );
}
