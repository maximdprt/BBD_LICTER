"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VoiceSharePoint } from "@/lib/types";

type Props = Readonly<{
  data: VoiceSharePoint[];
}>;

export function VoiceShareBarChart({ data }: Props) {
  const [mode, setMode] = useState<"absolute" | "relative">("relative");
  const rows = useMemo(() => {
    return data
      .map((d) => {
        const t = d.sephora + d.nocibe;
        const sephPct = t ? (d.sephora / t) * 100 : 0;
        const nociPct = t ? (d.nocibe / t) * 100 : 0;
        return { ...d, total: t, sephPct, nociPct, diff: Math.abs(sephPct - nociPct) };
      })
      .sort((a, b) => b.diff - a.diff);
  }, [data]);

  return (
    <div className="h-[330px] w-full rounded-2xl bg-gray-50 p-2">
      <div className="mb-2 flex justify-end gap-2">
        <button type="button" onClick={() => setMode("absolute")} className={`rounded-lg px-2 py-1 text-xs ${mode === "absolute" ? "bg-gray-800 text-white" : "bg-white text-gray-600"}`}>Volume absolu</button>
        <button type="button" onClick={() => setMode("relative")} className={`rounded-lg px-2 py-1 text-xs ${mode === "relative" ? "bg-gray-800 text-white" : "bg-white text-gray-600"}`}>Part relative %</button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barCategoryGap="24%" barGap={4}>
          <XAxis
            dataKey="source"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fontFamily: "DM Sans", fill: "#A89BA1" }}
          />
          <YAxis
            domain={mode === "relative" ? [0, 100] : [0, "auto"]}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fontFamily: "DM Sans", fill: "#A89BA1" }}
          />
          {mode === "relative" ? <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="4 3" /> : null}
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
            dataKey={mode === "relative" ? "sephPct" : "sephora"}
            name="Sephora"
            fill="var(--comex-bordeaux, #be185d)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
            animationBegin={100}
          >
            <LabelList dataKey={mode === "relative" ? "sephPct" : "sephora"} position="center" fill="#fff" fontSize={10} formatter={(v: unknown) => {
              const num = typeof v === "number" ? v : Number(v ?? 0);
              return mode === "relative" ? `${Math.round(num)}%` : `${Math.round(num)}`;
            }} />
          </Bar>
          <Bar
            dataKey={mode === "relative" ? "nociPct" : "nocibe"}
            name="Nocibé"
            fill="var(--comex-blue, #3b82f6)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={1100}
            animationEasing="ease-out"
            animationBegin={100}
          >
            <LabelList dataKey={mode === "relative" ? "nociPct" : "nocibe"} position="center" fill="#fff" fontSize={10} formatter={(v: unknown) => {
              const num = typeof v === "number" ? v : Number(v ?? 0);
              return mode === "relative" ? `${Math.round(num)}%` : `${Math.round(num)}`;
            }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 grid gap-1 text-center text-[11px] text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((d) => {
          const ps = Math.round(d.sephPct);
          const pn = Math.round(d.nociPct);
          return (
            <div key={d.source}>
              <span className="font-medium text-gray-800">{d.source}</span> — Sephora {ps}% · Nocibé {pn}% · total {d.total}
            </div>
          );
        })}
      </div>
    </div>
  );
}

