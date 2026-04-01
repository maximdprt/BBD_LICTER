"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
}>;

export function VoiceShareBarChart({ data }: Props) {
  return (
    <div className="h-[300px] w-full rounded-2xl bg-gray-50">
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
            fill="var(--comex-bordeaux, #be185d)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
            animationBegin={100}
          />
          <Bar
            dataKey="nocibe"
            name="Nocibé"
            fill="var(--comex-blue, #3b82f6)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={1100}
            animationEasing="ease-out"
            animationBegin={100}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 grid gap-1 text-center text-[11px] text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((d) => {
          const t = d.sephora + d.nocibe;
          const ps = t === 0 ? 0 : Math.round((d.sephora / t) * 100);
          const pn = t === 0 ? 0 : Math.round((d.nocibe / t) * 100);
          return (
            <div key={d.source}>
              <span className="font-medium text-gray-800">{d.source}</span> — Sephora {ps}% · Nocibé {pn}%
            </div>
          );
        })}
      </div>
    </div>
  );
}

