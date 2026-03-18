import { cn } from "@/lib/cn";
import type { Sentiment } from "@/lib/types";

type Props = Readonly<{
  sentiment: Sentiment;
  className?: string;
}>;

export function SentimentBadge({ sentiment, className }: Props) {
  const tone =
    sentiment === "positif"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : sentiment === "négatif"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-gray-50 text-gray-700 ring-gray-200";

  const label =
    sentiment === "positif" ? "Positif" : sentiment === "négatif" ? "Négatif" : "Neutre";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}

