import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = Readonly<{
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
  accent?: "gold" | "green" | "none";
}>;

const ACCENT_GRADIENT: Record<string, string> = {
  gold: "linear-gradient(90deg, #C9A96E 0%, #D4B87A 60%, transparent 100%)",
  green: "linear-gradient(90deg, #00A651 0%, #4DC47D 60%, transparent 100%)",
  none: "transparent",
};

export function ChartCard({ title, subtitle, right, children, isLoading, className, accent = "gold" }: Props) {
  const accentBar = ACCENT_GRADIENT[accent] ?? ACCENT_GRADIENT.gold;

  return (
    <section
      className={cn("relative overflow-hidden transition-shadow duration-200 hover:shadow-md", className)}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "28px 28px 24px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Accent top line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: accentBar }}
      />

      {/* Subtle top-right glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-[0.04]"
        style={{ background: accent === "green" ? "#00A651" : "#C9A96E", filter: "blur(40px)" }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--text-muted)", marginBottom: 5 }}
          >
            {title}
          </div>
          {subtitle ? (
            <div className="text-[13px] leading-snug" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="skeleton h-[260px] w-full rounded-xl" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
