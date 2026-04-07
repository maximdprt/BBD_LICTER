"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type Props = Readonly<{
  value: number | null;
  competitorValue?: number | null;
  sparkline?: { value: number }[];
  trend7d?: { deltaPoints: number | null; direction: "up" | "down" | "flat" } | null;
  className?: string;
  href?: string;
}>;

type Zone = { label: string; color: string; bg: string; track: string };

function getZone(v: number): Zone {
  if (v < 40) return { label: "Critique",  color: "#e24b4a", bg: "rgba(226,75,74,0.10)",  track: "#e24b4a" };
  if (v < 70) return { label: "Modéré",    color: "#f59e0b", bg: "rgba(245,158,11,0.10)", track: "#f59e0b" };
  return       { label: "Excellent", color: "#22c55e", bg: "rgba(34,197,94,0.10)",  track: "#22c55e" };
}

/** Coordonnée polaire (centre + rayon + angle en degrés) */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Chemin SVG d'un arc */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const s = polar(cx, cy, r, a0);
  const e = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function MiniSparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (data.length < 2) return null;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 88; const H = 32;
  const step = W / (vals.length - 1);
  const pts = vals.map((v, i) => `${i * step},${H - ((v - min) / range) * H}`).join(" ");
  const lastX = (vals.length - 1) * step;
  const lastY = H - ((vals[vals.length - 1]! - min) / range) * H;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function GaugeDial({ value, competitorValue }: { value: number; competitorValue: number | null }) {
  const reduce = useReducedMotion();
  const SIZE = 300;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 110;        // rayon arc principal
  const SW = 20;        // épaisseur arc
  const A0 = 135;       // angle départ (bas-gauche)
  const A1 = 405;       // angle fin (bas-droit), 270° de sweep
  const SPAN = A1 - A0; // 270

  const zone = getZone(value);

  // Angles des zones : critique 0–40, modéré 40–70, excellent 70–100
  const aZ1 = A0 + (40 / 100) * SPAN;   // 243°
  const aZ2 = A0 + (70 / 100) * SPAN;   // 324°

  // Angle de l'aiguille
  const needleAngle = A0 + (value / 100) * SPAN;
  const needleTip = polar(cx, cy, R - 12, needleAngle);

  // Angle du marqueur Nocibé
  const nociAngle = competitorValue != null ? A0 + (competitorValue / 100) * SPAN : null;
  const nociPos = nociAngle != null ? polar(cx, cy, R, nociAngle) : null;
  const nociLabel = nociAngle != null ? polar(cx, cy, R + 20, nociAngle) : null;

  return (
    <div className="relative mx-auto" style={{ width: SIZE, maxWidth: "100%" }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: "100%", overflow: "visible" }}>
        <defs>
          {/* Ombre portée sur l'aiguille */}
          <filter id="needleShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
          </filter>
          {/* Glow zone active */}
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track gris de fond */}
        <path d={arc(cx, cy, R, A0, A1)} fill="none" stroke="#f0f0f0" strokeWidth={SW} strokeLinecap="round" />

        {/* Zone critique — rouge */}
        <path d={arc(cx, cy, R, A0, aZ1)} fill="none" stroke="#fca5a5" strokeWidth={SW} strokeLinecap="butt" opacity={0.6} />
        {/* Zone modérée — orange */}
        <path d={arc(cx, cy, R, aZ1, aZ2)} fill="none" stroke="#fde68a" strokeWidth={SW} strokeLinecap="butt" opacity={0.6} />
        {/* Zone excellente — verte */}
        <path d={arc(cx, cy, R, aZ2, A1)} fill="none" stroke="#bbf7d0" strokeWidth={SW} strokeLinecap="butt" opacity={0.6} />

        {/* Arc de valeur actuelle (fill progressif animé via stroke-dasharray) */}
        <motion.path
          d={arc(cx, cy, R, A0, needleAngle)}
          fill="none"
          stroke={zone.track}
          strokeWidth={SW}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          filter="url(#arcGlow)"
        />

        {/* Marqueur Nocibé */}
        {nociPos && nociLabel && (
          <g>
            <circle cx={nociPos.x} cy={nociPos.y} r={7} fill="#00A651" stroke="white" strokeWidth={2.5} />
            <circle cx={nociPos.x} cy={nociPos.y} r={3} fill="white" />
            {/* Ligne de connexion vers le label */}
            <line
              x1={nociPos.x} y1={nociPos.y}
              x2={nociLabel.x} y2={nociLabel.y}
              stroke="#00A651" strokeWidth={1} strokeDasharray="3 2" opacity={0.6}
            />
            <text
              x={nociLabel.x}
              y={nociLabel.y - 6}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#00A651"
              fontFamily="DM Sans, sans-serif"
            >
              Nocibé {competitorValue}
            </text>
          </g>
        )}

        {/* Aiguille */}
        <motion.g
          initial={reduce ? false : { rotate: -120, transformOrigin: `${cx}px ${cy}px` }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          filter="url(#needleShadow)"
        >
          <line
            x1={cx} y1={cy}
            x2={needleTip.x} y2={needleTip.y}
            stroke="#111827" strokeWidth={3.5} strokeLinecap="round"
          />
        </motion.g>

        {/* Pivot central */}
        <circle cx={cx} cy={cy} r={11} fill="#111827" />
        <circle cx={cx} cy={cy} r={5} fill="white" />

        {/* Ticks 0 / 50 / 100 */}
        {[0, 50, 100].map((tick) => {
          const angle = A0 + (tick / 100) * SPAN;
          const inner = polar(cx, cy, R - SW / 2 - 6, angle);
          const outer = polar(cx, cy, R + SW / 2 + 6, angle);
          const lbl = polar(cx, cy, R + SW / 2 + 18, angle);
          return (
            <g key={tick}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#d1d5db" strokeWidth={1.5} />
              <text x={lbl.x} y={lbl.y + 4} textAnchor="middle" fontSize="9" fill="#b0b8c4" fontFamily="DM Mono, monospace">
                {tick}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Score centré par-dessus le SVG */}
      <div
        className="pointer-events-none absolute flex flex-col items-center"
        style={{ top: "46%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <span className="font-mono font-black leading-none text-gray-900 tabular-nums" style={{ fontSize: 68, lineHeight: 1 }}>
          <AnimatedCounter value={value} duration={1300} decimals={0} />
        </span>
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.35 }}
          className="mt-2 rounded-full px-3.5 py-1 text-[12px] font-bold"
          style={{ background: zone.bg, color: zone.color }}
        >
          {zone.label}
        </motion.span>
      </div>
    </div>
  );
}

export function SentimentGauge({ value, competitorValue, sparkline, trend7d, className, href = "/reputation" }: Props) {
  const reduce = useReducedMotion();

  const sephScore = value != null ? Math.max(0, Math.min(100, value)) : null;
  const nociScore = competitorValue != null ? Math.max(0, Math.min(100, competitorValue)) : null;
  const delta = sephScore != null && nociScore != null ? Math.round((sephScore - nociScore) * 10) / 10 : null;

  const delta7d = trend7d?.deltaPoints != null ? Math.round(trend7d.deltaPoints * 10) / 10 : null;
  const dir7d = trend7d?.direction ?? "flat";

  const delta30d = (() => {
    if (!sparkline || sparkline.length < 2) return null;
    return Math.round((sparkline[sparkline.length - 1]!.value - sparkline[0]!.value) * 10) / 10;
  })();

  const sparkColor = (() => {
    if (delta30d == null) return "#C9A96E";
    if (delta30d > 1) return "#22c55e";
    if (delta30d < -1) return "#ef4444";
    return "#C9A96E";
  })();

  const dir7dColor = dir7d === "up" ? "#16a34a" : dir7d === "down" ? "#ef4444" : "#9ca3af";

  if (sephScore == null) {
    return (
      <div className={cn("flex h-32 items-center justify-center rounded-2xl border border-gray-100 bg-white text-sm text-gray-400", className)}>
        Données de sentiment non disponibles
      </div>
    );
  }

  const card = (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-white transition-shadow duration-200 hover:shadow-md",
        className,
      )}
      style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Accent top */}
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg, #C9A96E 0%, #D4B87A 45%, transparent 100%)" }} />

      {/* Glow bg */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04]"
        style={{ width: 260, height: 260, background: getZone(sephScore).track, filter: "blur(48px)" }}
      />

      <div className="relative p-5 pb-4">
        {/* Gauge */}
        <GaugeDial value={sephScore} competitorValue={nociScore != null ? Math.round(nociScore) : null} />

        {/* Delta vs Nocibé */}
        {delta != null && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.35 }}
            className="mt-3 flex justify-center"
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
              style={
                delta > 0 ? { background: "rgba(34,197,94,0.10)", color: "#16a34a" }
                : delta < 0 ? { background: "rgba(239,68,68,0.10)", color: "#ef4444" }
                : { background: "#f3f4f6", color: "#6b7280" }
              }
            >
              {delta > 0 ? <ArrowUpRight className="size-3.5" /> : delta < 0 ? <ArrowDownRight className="size-3.5" /> : <Minus className="size-3.5" />}
              {delta > 0 ? "+" : ""}{delta.toFixed(1)} pts vs Nocibé
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div className="my-4 h-px bg-gray-100" />

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          {/* 7 jours */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.35 }}
            className="flex flex-col items-center gap-1.5 rounded-xl py-3"
            style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">7 JOURS</span>
            {delta7d != null ? (
              <div className="flex items-center gap-1.5">
                {dir7d === "up" ? (
                  <ArrowUpRight className="size-4" style={{ color: dir7dColor }} />
                ) : dir7d === "down" ? (
                  <ArrowDownRight className="size-4" style={{ color: dir7dColor }} />
                ) : (
                  <Minus className="size-4" style={{ color: dir7dColor }} />
                )}
                <span className="font-mono text-[15px] font-bold tabular-nums" style={{ color: dir7dColor }}>
                  {delta7d > 0 ? "+" : ""}{delta7d.toFixed(1)} pts
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </motion.div>

          {/* 30 jours */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.35 }}
            className="flex flex-col items-center gap-1.5 rounded-xl py-3"
            style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">30 JOURS</span>
            {sparkline && sparkline.length > 1 ? (
              <div className="flex flex-col items-center gap-1">
                <MiniSparkline data={sparkline} color={sparkColor} />
                {delta30d != null && (
                  <span className="font-mono text-[13px] font-bold tabular-nums" style={{ color: sparkColor }}>
                    {delta30d > 0 ? "+" : ""}{delta30d.toFixed(1)} pts
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}
