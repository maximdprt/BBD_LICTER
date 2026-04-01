"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function AnimatedCounter({
  value,
  duration = 1600,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    if (duration <= 0) {
      setDisplay(Number.isFinite(value) ? value : 0);
      return;
    }

    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const next = parseFloat((eased * value).toFixed(decimals));
      setDisplay(next);
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }, [isInView, value, duration, decimals]);

  return (
    <span ref={ref} className={className ?? "font-mono tabular-nums"}>
      {display.toLocaleString("fr-FR", { minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

