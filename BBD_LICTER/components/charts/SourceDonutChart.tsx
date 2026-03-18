"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
  marque: "Sephora" | "Nocibé";
}>;

const COLORS = ["#6C3BE4", "#06B6D4", "#A78BFA", "#0EA5E9"];

export function SourceDonutChart({ data, marque }: Props) {
  const pieData = data.map((d) => ({
    name: d.source,
    value: marque === "Sephora" ? d.sephora : d.nocibe,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid rgba(229,231,235,1)",
              boxShadow: "0 8px 20px rgba(15,15,26,0.06)",
            }}
          />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={105}
            paddingAngle={3}
            stroke="rgba(255,255,255,1)"
            strokeWidth={2}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

