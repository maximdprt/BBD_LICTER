"use client";

import { MobileSidebar } from "@/components/layout/MobileSidebar";

export function TopBar() {
  return (
    <header
      className="sticky top-0 z-10"
      style={{
        height: 60,
        background: "rgba(253,252,251,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <MobileSidebar />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}
        >
          SEPHORA Intel
        </div>
        <div
          style={{
            marginTop: 2,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-muted)",
            fontWeight: 400,
          }}
        >
          Brand & Market Intelligence
        </div>
      </div>

      <button
        type="button"
        style={{
          background: "var(--s-black)",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: "8px 20px",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
          transition: "background 200ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#2D1018";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--s-black)";
        }}
      >
        Export PDF
      </button>
    </header>
  );
}

