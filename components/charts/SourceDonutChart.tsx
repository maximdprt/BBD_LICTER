"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { VoiceSharePoint } from "@/lib/types";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  data: VoiceSharePoint[];
  marque: "Sephora" | "Nocibé";
}>;

export function SourceDonutChart({ data, marque }: Props) {
  const valueBySource = new Map<string, number>();
  for (const d of data) {
    valueBySource.set(d.source, marque === "Sephora" ? d.sephora : d.nocibe);
  }

  const ordered = [
    { source: "Twitter/X", color: "#1DA1F2" },
    { source: "Instagram", color: "#E1306C" },
    { source: "TikTok", color: "#2D2D2D" },
    { source: "LinkedIn", color: "#0A66C2" },
  ] as const;

  const pieData = ordered.map((o) => ({
    name: o.source,
    value: valueBySource.get(o.source) ?? 0,
    color: o.color,
  }));

  const total = pieData.reduce((acc, p) => acc + p.value, 0);

  return (
    <div className="relative h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #EDE8E6",
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
            animationDuration={1000}
            animationEasing="ease-out"
            animationBegin={100}
          >
            {pieData.map((p) => (
              <Cell key={p.name} fill={p.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Label central donut */}
      <div
        className="pointer-events-none absolute inset-0 grid place-items-center"
        style={{ transform: "translateY(6px)" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <AnimatedCounter
            value={total}
            duration={1400}
            decimals={0}
            className="font-mono text-[26px] font-medium text-[var(--text-primary)]"
          />
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)" }}>
            mentions
          </div>
        </div>
      </div>

      {/* Legend 2x2 */}
      <div
        className="absolute bottom-2 left-0 right-0"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 8,
          padding: "0 16px",
          fontFamily: "DM Sans",
        }}
      >
        {pieData.map((p) => {
          return (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: p.color, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.name}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {p.value}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

