"use client";

import { MobileSidebar } from "@/components/layout/MobileSidebar";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      {/* Bandeau marque 8px: alternance carrés noir/blanc */}
      <div
        className="h-2 w-full"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #000000 0 12px, #FFFFFF 12px 24px)",
        }}
      />

      <div className="mx-auto grid h-[56px] w-full max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-6">
        <div className="flex items-center">
          <MobileSidebar />
        </div>

        {/* Titre central */}
        <div className="text-center">
          <div className="font-display text-[26px] font-extrabold uppercase tracking-[0.3em] text-[#000000]">
            SEPHORA
          </div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#3b3b3b]">
            INTEL
          </div>
        </div>

        {/* Action à droite */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="rounded-sm border border-[#FDC9D3] bg-white px-4 py-2 text-sm font-semibold text-[#000000] transition hover:bg-black/5"
          >
            Export PDF
          </button>
        </div>
      </div>
    </header>
  );
}

