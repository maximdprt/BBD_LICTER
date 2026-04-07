"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = Readonly<{
  value: number | null;
  className?: string;
}>;

/**
 * Jauge demi-cercle 0–100% — Part de voix Sephora.
 * Rendue via SVG pur pour un rendu pixel-perfect.
 */
export function VoiceShareHalfGauge({ value, className }: Props) {
  const reduce = useReducedMotion();
  const v = value == null || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(100, value));

  // SVG arc params
  const W = 200;
  const H = 110;
  const cx = W / 2;
  const cy = H - 10;
  const R = 84;
  const STROKE = 16;
  const GAP = 4; // gap between track and fill

  // Angles: left = 180°, right = 0° → arc from 180 to 0 (half circle on top)
  function polarXY(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(startDeg: number, endDeg: number, r: number) {
    const s = polarXY(startDeg, r);
    const e = polarXY(endDeg, r);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg > startDeg ? 1 : 0; // clockwise
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`;
  }

  // 0% → 180°, 100% → 0°
  const startAngle = 180;
  const endAngle = 0;
  const fillAngle = startAngle + (v / 100) * (endAngle - startAngle); // goes from 180 → 0

  // Zone color
  const zoneColor = v < 40 ? "#ef4444" : v < 60 ? "#f59e0b" : "#22c55e";
  const zoneLabel = v < 40 ? "Faible" : v < 60 ? "Équilibré" : "Dominant";

  return (
    <div className={className} style={{ width: "100%", maxWidth: 220, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A96E" />
            <stop offset="100%" stopColor={zoneColor} />
          </linearGradient>
        </defs>

        {/* Track */}
        <path
          d={describeArc(180, 0, R)}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* Fill */}
        {v > 0 && (
          <motion.path
            d={describeArc(180, fillAngle, R)}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}

        {/* Tick marks at 0, 50, 100 */}
        {[0, 50, 100].map((tick) => {
          const angle = 180 + (tick / 100) * (0 - 180);
          const inner = polarXY(angle, R - STROKE / 2 - 4);
          const label = polarXY(angle, R - STROKE / 2 - 14);
          return (
            <g key={tick}>
              <text
                x={label.x}
                y={label.y + 4}
                textAnchor="middle"
                fontSize={9}
                fill="#b0b8c4"
                fontFamily="DM Mono, monospace"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Needle */}
        {(() => {
          const angle = 180 + (v / 100) * (0 - 180);
          const tip = polarXY(angle, R - 2);
          return (
            <motion.line
              x1={cx}
              y1={cy}
              x2={tip.x}
              y2={tip.y}
              stroke="#111827"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={reduce ? false : { rotate: 90 }}
              animate={{ rotate: 0 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
            />
          );
        })()}
        <circle cx={cx} cy={cy} r={5} fill="#111827" />
      </svg>

      {/* Value */}
      <div className="mt-1 text-center">
        <div className="font-mono text-2xl font-bold text-gray-900 tabular-nums">
          {value == null ? "—" : `${Math.round(v)}%`}
        </div>
        {value != null && (
          <div
            className="mx-auto mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ background: zoneColor + "18", color: zoneColor }}
          >
            {zoneLabel}
          </div>
        )}
      </div>
    </div>
  );
}
