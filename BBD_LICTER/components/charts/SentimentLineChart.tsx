"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklySentimentPoint } from "@/lib/types";

type Props = Readonly<{
  data: WeeklySentimentPoint[];
}>;

export function SentimentLineChart({ data }: Props) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(15,15,26,0.06)" vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: "rgba(107,114,128,0.9)" }}
          />
          <YAxis
            domain={[0, 100]}
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
          <Line
            type="monotone"
            dataKey="sephora"
            name="Sephora"
            stroke="#6C3BE4"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="nocibe"
            name="Nocibé"
            stroke="#06B6D4"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

