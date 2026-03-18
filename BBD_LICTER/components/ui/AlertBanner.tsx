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
          wrap: "border-rose-200 bg-rose-50/70 text-rose-900",
          icon: "text-rose-600",
          Icon: AlertTriangle,
        }
      : tone === "warning"
        ? {
            wrap: "border-amber-200 bg-amber-50/70 text-amber-900",
            icon: "text-amber-600",
            Icon: AlertTriangle,
          }
        : {
            wrap: "border-sky-200 bg-sky-50/70 text-sky-900",
            icon: "text-sky-600",
            Icon: Activity,
          };

  const Icon = styles.Icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-3xl border px-4 py-3 shadow-sm backdrop-blur-sm",
        styles.wrap,
        className,
      )}
      role="status"
    >
      <div className={cn("mt-0.5 grid size-9 place-items-center rounded-2xl bg-white/70", styles.icon)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-sm/5 opacity-80">{description}</div>
      </div>
    </div>
  );
}

