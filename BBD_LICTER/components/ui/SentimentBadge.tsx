import { cn } from "@/lib/cn";
import type { Sentiment } from "@/lib/types";

type Props = Readonly<{
  sentiment: Sentiment;
  className?: string;
}>;

export function SentimentBadge({ sentiment, className }: Props) {
  const tone =
    sentiment === "positif"
      ? "bg-[var(--positive-bg)] text-[#2A9460]"
      : sentiment === "négatif"
        ? "bg-[var(--negative-bg)] text-[#C0392B]"
        : "bg-[var(--neutral-bg)] text-[#5A6478]";

  const label =
    sentiment === "positif" ? "Positif" : sentiment === "négatif" ? "Négatif" : "Neutre";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-[3px] text-[11px] font-semibold uppercase tracking-[0.06em]",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}

