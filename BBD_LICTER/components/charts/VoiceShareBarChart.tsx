"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
          <CartesianGrid stroke="rgba(15,15,26,0.06)" vertical={false} />
          <XAxis
            dataKey="source"
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
            labelStyle={{ color: "rgba(15,15,26,0.85)" }}
          />
          <Legend />
          <Bar dataKey="sephora" name="Sephora" fill="#6C3BE4" radius={[10, 10, 0, 0]} />
          <Bar dataKey="nocibe" name="Nocibé" fill="#06B6D4" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

