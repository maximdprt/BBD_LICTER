"use client";

import { format, getISOWeek, parseISO } from "date-fns";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  ReferenceArea,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import type { WeeklySentimentPoint } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = Readonly<{
  data: WeeklySentimentPoint[];
}>;

function weekLabel(weekStart: string) {
  try {
    const d = parseISO(weekStart);
    return format(d, "dd/MM");
  } catch {
    return weekStart;
  }
}

type TooltipPayloadItem = Readonly<{
  dataKey?: string;
  name?: string;
  value?: number | null;
  color?: string;
}>;

function BrandPill(props: { brand: "Sephora" | "Nocibé" }) {
  const isSephora = props.brand === "Sephora";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold",
        isSephora ? "border-[#FDC9D3]/30 bg-[#FDC9D3]/10 text-white" : "border-white/15 bg-white/5 text-white",
      )}
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full text-[10px] font-extrabold",
          isSephora ? "bg-[#FDC9D3] text-black" : "bg-black text-[#FDC9D3]",
        )}
      >
        {isSephora ? "S" : "N"}
      </span>
      {props.brand}
    </span>
  );
}

function SentimentTooltip({
  active,
  payload,
  label,
}: Readonly<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}>) {
  if (!active || !payload?.length) return null;

  const seph = payload.find((p) => p.dataKey === "sephora");
  const noci = payload.find((p) => p.dataKey === "nocibe");

  return (
    <div className="min-w-[240px] rounded-sm border border-[#FDC9D3]/25 bg-black/95 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white">
        {label ? weekLabel(label) : ""}
      </div>

      <div className="mt-2 space-y-2">
        {seph ? (
          <div className="flex items-center justify-between gap-3">
            <BrandPill brand="Sephora" />
              <div className="text-sm font-semibold tabular-nums text-white">
              {typeof seph.value === "number" ? seph.value.toFixed(1) : "—"}
                <span className="ml-1 text-xs font-medium text-white/70">/100</span>
            </div>
          </div>
        ) : null}

        {noci ? (
          <div className="flex items-center justify-between gap-3">
            <BrandPill brand="Nocibé" />
              <div className="text-sm font-semibold tabular-nums text-white">
              {typeof noci.value === "number" ? noci.value.toFixed(1) : "—"}
                <span className="ml-1 text-xs font-medium text-white/70">/100</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SentimentLineChart({ data }: Props) {
  const last = [...data].reverse().find((p) => typeof p.sephora === "number" || typeof p.nocibe === "number");
  const deltaPts =
    last && typeof last.sephora === "number" && typeof last.nocibe === "number"
      ? Math.round((last.sephora - last.nocibe) * 10) / 10
      : null;

  const crisisPoint = data.find((p) => typeof p.sephora === "number" && p.sephora < 40);
  const crisisWeek =
    crisisPoint?.weekStart && /^\d{4}-\d{2}-\d{2}$/.test(crisisPoint.weekStart)
      ? getISOWeek(parseISO(crisisPoint.weekStart))
      : 12;

  return (
    <div className="w-full">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <ReferenceArea y1={0} y2={40} fill="rgba(255, 0, 237, 0.08)" strokeOpacity={0} />
            <XAxis
              dataKey="weekStart"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={weekLabel}
              tick={{ fill: "rgba(0,0,0,0.55)" }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: "rgba(0,0,0,0.55)" }}
            />
            <Tooltip content={<SentimentTooltip />} />

            <Line
              type="monotone"
              dataKey="sephora"
              name="Sephora"
              stroke="#000000"
              strokeWidth={5}
              dot={false}
              activeDot={{ r: 5, fill: "#FDC9D3", stroke: "#FDC9D3", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
              animationBegin={100}
            />
            <Line
              type="monotone"
              dataKey="nocibe"
              name="Nocibé"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
              animationBegin={200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-sm border-[0.5px] border-black/10 bg-white border-l-[6px] border-[#FDC9D3] p-4">
        <div className="absolute inset-x-0 top-0 h-[2px] sephora-stripes" />
        <div className="flex items-start gap-3">
          <div className="relative grid size-10 place-items-center overflow-hidden rounded-sm border border-black/10 bg-white text-[#FDC9D3]">
            <div className="pointer-events-none absolute inset-0 bg-[#FDC9D3]/25 blur-md opacity-60" />
            <Sparkles className="relative z-10 size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-black">IA Insight</div>
            <div className="mt-1 text-sm font-medium text-black">
              {`Sephora maintient son leadership (${
                deltaPts == null ? "+8" : `${deltaPts > 0 ? "+" : ""}${deltaPts}`
              }pts) grâce à l'accueil en magasin, malgré une baisse de satisfaction sur les délais de livraison en semaine ${crisisWeek}.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

