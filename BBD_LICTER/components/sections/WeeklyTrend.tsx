"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
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
          <XAxis
            dataKey="weekStart"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: "rgba(0,0,0,0.55)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: "rgba(0,0,0,0.55)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="value" name="Volume" fill="#000000" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

