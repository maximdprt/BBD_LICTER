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
        "relative overflow-hidden rounded-sm border-[0.5px] border-black/10 bg-white p-5",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] sephora-stripes" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-black">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-xs text-text-secondary">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="h-[260px] w-full animate-pulse rounded-sm bg-black/4" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

