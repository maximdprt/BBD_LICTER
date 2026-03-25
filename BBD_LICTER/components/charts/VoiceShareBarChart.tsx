"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
}>;

export function VoiceShareBarChart({ data }: Props) {
  return (
    <div className="h-[280px] w-full" style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-card)" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="28%" barGap={4}>
          <XAxis
            dataKey="source"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fontFamily: "DM Sans", fill: "#A89BA1" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fontFamily: "DM Sans", fill: "#A89BA1" }}
          />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #EDE8E6",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              padding: "12px 16px",
              fontFamily: "DM Sans",
            }}
            labelStyle={{ color: "var(--text-primary)" }}
          />
          <Bar
            dataKey="sephora"
            name="Sephora"
            fill="#C4637A"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
            animationBegin={100}
          />
          <Bar
            dataKey="nocibe"
            name="Nocibé"
            fill="#6B8FB5"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={1100}
            animationEasing="ease-out"
            animationBegin={100}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

