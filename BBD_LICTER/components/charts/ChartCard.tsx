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
      className={cn(
        "rounded-3xl border border-gray-100 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-xs text-text-secondary">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="h-[260px] w-full animate-pulse rounded-2xl bg-black/4" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

