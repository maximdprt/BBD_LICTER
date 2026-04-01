"use client";

import { MobileSidebar } from "@/components/layout/MobileSidebar";

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
      backgroundColor: "#fafaf8",
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
        height: 60,
        background: "rgba(250,250,248,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--comex-border)",
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
            color: "var(--comex-text)",
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
            color: "var(--comex-text-muted)",
            fontWeight: 400,
          }}
        >
          Brand & Market Intelligence
        </div>
      </div>

      <button
        type="button"
        style={{
          background: "var(--comex-bordeaux)",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: "8px 20px",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
          transition: "opacity 200ms ease",
        }}
        onClick={() => void exportPdf()}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        }}
      >
        Export PDF
      </button>
    </header>
  );
}
