"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";
import { cn } from "@/lib/cn";
import type { WeeklyPoint } from "@/lib/types";

type Props = Readonly<{
  data: WeeklyPoint[];
  className?: string;
}>;

export function WeeklyTrend({ data, className }: Props) {
  const lastIdx = Math.max(0, data.length - 1);

  return (
    <div className={cn("h-[280px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={100}>
        <BarChart data={data} barCategoryGap={10}>
          <CartesianGrid stroke="#EDE8E6" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="weekStart"
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
              borderRadius: 12,
              border: "1px solid #EDE8E6",
              background: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              padding: "12px 16px",
              fontFamily: "DM Sans",
            }}
          />
          <Bar
            dataKey="value"
            name="Volume"
            fill="#C4637A"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
            animationBegin={100}
          >
            {data.map((p, idx) => (
              <Cell
                key={p.weekStart}
                fill="#C4637A"
                fillOpacity={idx === lastIdx ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

