import { cn } from "@/lib/cn";

type Props = Readonly<{
  tone: "danger" | "warning" | "info";
  title: string;
  description: string;
  className?: string;
}>;

export function AlertBanner({ tone, title, description, className }: Props) {
  const isDanger = tone === "danger";

  return (
    <div
      className={cn(isDanger ? "alert-banner" : "", className)}
      role="status"
      style={{
        background:
          tone === "danger" ? "linear-gradient(135deg, #FDEEF0, #FDF7F8)" : "var(--bg-card)",
        borderLeft: tone === "danger" ? "4px solid #E05C6B" : "4px solid rgba(20,7,16,0.12)",
        borderRadius: "0 16px 16px 0",
        padding: "16px 24px",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        marginBottom: 24,
      }}
    >
      <div style={{ fontSize: 20, marginTop: 1, color: tone === "danger" ? "#E05C6B" : "var(--text-secondary)" }}>
        ⚠️
      </div>
      <div className="min-w-0">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: tone === "danger" ? "#C0392B" : "var(--text-secondary)",
            marginBottom: 4,
          }}
        >
          {title}
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

