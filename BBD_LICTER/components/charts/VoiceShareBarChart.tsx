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
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={14}>
          <XAxis
            dataKey="source"
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
            labelStyle={{ color: "rgba(0,0,0,0.85)" }}
          />
          <Bar
            dataKey="sephora"
            name="Sephora"
            fill="#000000"
            radius={[2, 2, 0, 0]}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
            animationBegin={100}
          />
          <Bar
            dataKey="nocibe"
            name="Nocibé"
            fill="rgba(0,0,0,0.35)"
            radius={[2, 2, 0, 0]}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
            animationBegin={200}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

