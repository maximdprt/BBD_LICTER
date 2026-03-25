import { cn } from "@/lib/cn";
import { AlertTriangle, Activity } from "lucide-react";

type Props = Readonly<{
  tone: "danger" | "warning" | "info";
  title: string;
  description: string;
  className?: string;
}>;

export function AlertBanner({ tone, title, description, className }: Props) {
  const styles =
    tone === "danger"
      ? {
          wrap: "alert-banner alert-banner--danger bg-white text-black border-l-4 border-l-[#E05C6B]",
          icon: "text-[#FF00ED]",
          Icon: AlertTriangle,
        }
      : tone === "warning"
        ? {
            wrap: "bg-white text-black border-l-4 border-l-black/10",
            icon: "text-black",
            Icon: AlertTriangle,
          }
        : {
            wrap: "bg-white text-black border-l-4 border-l-black/10",
            icon: "text-black",
            Icon: Activity,
          };

  const Icon = styles.Icon;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 overflow-hidden rounded-sm border-[0.5px] px-4 py-3",
        styles.wrap,
        className,
      )}
      role="status"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] sephora-stripes" />
      <div className={cn("mt-0.5 grid size-9 place-items-center rounded-sm border border-black/10 bg-white", styles.icon)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-[0.2em]">{title}</div>
        <div className="mt-1 text-sm/5 text-black/70">{description}</div>
      </div>
    </div>
  );
}

