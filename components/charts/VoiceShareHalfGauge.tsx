"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { SafeResponsiveContainer as ResponsiveContainer } from "@/components/charts/SafeResponsiveContainer";

type Props = Readonly<{
  value: number | null;
  className?: string;
}>;

/**
 * Jauge demi-cercle 0–100 % (part de voix Sephora).
 */
export function VoiceShareHalfGauge({ value, className }: Props) {
  const reduce = useReducedMotion();
  const v = value == null || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(100, value));
  const data = [{ name: "share", value: v, fill: "#C9A96E" }];

  return (
    <div className={className} style={{ height: 112, minHeight: 112, width: "100%", maxWidth: 200, margin: "0 auto" }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={80}>
        <RadialBarChart
          innerRadius="68%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
          barSize={14}
          margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: "rgba(17,24,39,0.06)" }}
            isAnimationActive={!reduce}
            animationDuration={500}
            animationEasing="ease-out"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <motion.div
        className="text-center font-mono text-lg font-semibold tabular-nums"
        style={{ color: "var(--text-primary)", marginTop: -8 }}
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {value == null ? "—" : `${Math.round(v)}%`}
      </motion.div>
    </div>
  );
}
