"use client";

import type { ThemeInsight } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useId } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from "recharts";

type Props = Readonly<{
  data: ThemeInsight[];
  className?: string;
}>;

export function ThemeAnalysis({ data, className }: Props) {
  const top = data.slice(0, 5);
  const gradientId = useId();

  if (top.length === 0) {
    return (
      <div
        className={cn("rounded-2xl border border-border bg-[var(--bg-card)] p-4 text-sm")}
        style={{ color: "var(--text-muted)" }}
      >
        Aucun thème sur la période.
      </div>
    );
  }

  const chartData = top.map((t) => ({
    theme: t.theme,
    count: t.count,
  }));

  return (
    <div className={cn("h-[280px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id={`barGrad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C4637A" />
              <stop offset="100%" stopColor="#E8A0B4" />
            </linearGradient>
          </defs>

          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="theme"
            width={160}
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: "DM Sans", fontSize: 13, fill: "var(--text-secondary)", fontWeight: 500 }}
          />

          <Tooltip />

          <Bar
            dataKey="count"
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
            radius={[0, 8, 8, 0]}
            fill={`url(#barGrad-${gradientId})`}
          >
            <LabelList
              dataKey="count"
              position="right"
              offset={8}
              style={{ fontFamily: "DM Mono", fontSize: 12, fill: "var(--text-muted)", fontWeight: 400 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

