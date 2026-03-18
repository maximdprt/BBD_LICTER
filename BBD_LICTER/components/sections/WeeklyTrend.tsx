"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/cn";
import type { WeeklyPoint } from "@/lib/types";

type Props = Readonly<{
  data: WeeklyPoint[];
  className?: string;
}>;

export function WeeklyTrend({ data, className }: Props) {
  return (
    <div className={cn("h-[280px] w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={10}>
          <CartesianGrid stroke="rgba(15,15,26,0.06)" vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: "rgba(107,114,128,0.9)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: "rgba(107,114,128,0.9)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: "1px solid rgba(229,231,235,1)",
              boxShadow: "0 8px 20px rgba(15,15,26,0.06)",
            }}
          />
          <Bar dataKey="value" name="Volume" fill="#A78BFA" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

