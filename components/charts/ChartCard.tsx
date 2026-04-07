import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = Readonly<{
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}>;

export function ChartCard({ title, subtitle, right, children, isLoading, className }: Props) {
  return (
    <section
      className={cn("relative overflow-hidden", className)}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "28px 32px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Gold accent top line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, #C9A96E, transparent 60%)" }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className="text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </div>
          {subtitle ? (
            <div className="mt-1 text-[13px]" style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="skeleton h-[260px] w-full rounded-sm" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
