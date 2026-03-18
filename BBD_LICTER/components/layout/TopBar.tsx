"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Filter, Search } from "lucide-react";
import { MobileSidebar } from "@/components/layout/MobileSidebar";

export function TopBar() {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <MobileSidebar />
          <div className="min-w-0">
            <div className="font-display text-[15px] font-extrabold tracking-tight text-foreground">
              Intelligence COMEX — Sephora
            </div>
            <div className="mt-0.5 hidden items-center gap-2 text-xs text-text-secondary sm:flex">
              <Calendar className="size-3.5" />
              <span className="truncate capitalize">{today}</span>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm">
            <Search className="size-4 text-text-secondary" />
            <input
              className="w-56 bg-transparent text-sm outline-none placeholder:text-text-secondary"
              placeholder="Rechercher un thème, une mention…"
              aria-label="Recherche"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-black/2"
          >
            <Filter className="size-4 text-accent" />
            6 derniers mois
          </button>
        </div>
      </div>
    </header>
  );
}

