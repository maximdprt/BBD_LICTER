"use client";

import { useEffect, useMemo, useState } from "react";
import { animate } from "framer-motion";

type Props = Readonly<{
  value: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}>;

export function AnimatedCounter({
  value,
  durationMs = 2000,
  decimals = 0,
  prefix,
  suffix,
  className,
}: Props) {
  const [display, setDisplay] = useState(0);

  const fmt = useMemo(() => {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  }, [decimals]);

  useEffect(() => {
    const controls = animate(display, value, {
      duration: durationMs / 1000,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, decimals]);

  return (
    <span className={className}>
      {prefix}
      {fmt.format(display)}
      {suffix}
    </span>
  );
}

