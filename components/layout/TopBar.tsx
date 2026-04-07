"use client";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { SephoraLogo } from "@/components/ui/SephoraLogo";

export function TopBar() {
  const exportPdf = async () => {
    const el = document.getElementById("pdf-capture-area");
    if (!el) return;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#FAF8F5",
    });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save("SEPHORA-Intel-export.pdf");
  };

  return (
    <header
      className="sticky top-0 z-10"
      style={{
        height: 64,
        background: "rgba(250,248,245,0.92)",
        backdropFilter: "blur(16px)",
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

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SephoraLogo size={24} className="text-black" />
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              color: "#000000",
              lineHeight: 1.1,
              letterSpacing: "0.02em",
            }}
          >
            SEPHORA Intel
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              color: "var(--s-gold)",
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            Brand & Market Intelligence
          </div>
        </div>
      </div>

      <button
        type="button"
        style={{
          background: "#000000",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: "8px 20px",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 600,
          border: "1px solid rgba(201,169,110,0.2)",
          cursor: "pointer",
          transition: "all 200ms ease",
          letterSpacing: "0.02em",
        }}
        onClick={() => void exportPdf()}
        onMouseEnter={(e) => {
          const btn = e.currentTarget;
          btn.style.background = "#C9A96E";
          btn.style.color = "#000000";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          btn.style.background = "#000000";
          btn.style.color = "#FFFFFF";
        }}
      >
        Export PDF
      </button>
    </header>
  );
}
