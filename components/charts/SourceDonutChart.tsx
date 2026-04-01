"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { VoiceSharePoint } from "@/lib/types";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  data: VoiceSharePoint[];
  marque: "Sephora" | "Nocibé";
}>;

const SOURCE_COLORS: Record<string, string> = {
  Trustpilot: "#00b67a",
  Google: "#4285F4",
  TikTok: "#000000",
  Instagram: "#E1306C",
  LinkedIn: "#0A66C2",
  Reddit: "#FF4500",
};

export function SourceDonutChart({ data, marque }: Props) {
  const pieData = data.map((d) => ({
    name: d.source,
    value: marque === "Sephora" ? d.sephora : d.nocibe,
    color: SOURCE_COLORS[d.source] ?? "#9ca3af",
  }));

  const total = pieData.reduce((acc, p) => acc + p.value, 0);

  return (
    <div className="relative h-[280px] w-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--comex-border)",
              background: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              padding: 12,
              fontFamily: "DM Sans",
            }}
          />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={68}
            outerRadius={100}
            paddingAngle={3}
            stroke="rgba(255,255,255,1)"
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {pieData.map((p) => (
              <Cell key={p.name} fill={p.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div
        className="pointer-events-none absolute inset-0 grid place-items-center"
        style={{ transform: "translateY(6px)" }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <AnimatedCounter
            value={total}
            duration={600}
            decimals={0}
            className="font-mono text-[26px] font-medium text-[var(--comex-text)]"
          />
          <div className="text-[11px] text-gray-500">signaux</div>
        </div>
      </div>

      <div
        className="absolute bottom-2 left-0 right-0 grid grid-cols-2 gap-2 px-4"
        style={{ fontFamily: "DM Sans" }}
      >
        {pieData.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-xs">
            <span className="size-2 shrink-0 rounded-full" style={{ background: p.color }} />
            <span className="truncate text-gray-600">{p.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-gray-900">
              {total ? Math.round((p.value / total) * 100) : 0}% — {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
