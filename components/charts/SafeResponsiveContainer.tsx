"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { ResponsiveContainer } from "recharts";

type Props = ComponentProps<typeof ResponsiveContainer>;

export function SafeResponsiveContainer(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: props.width ?? "100%",
          height: props.height ?? "100%",
          minWidth: props.minWidth ?? 100,
          minHeight: props.minHeight ?? 80,
        }}
      />
    );
  }

  return <ResponsiveContainer {...props} />;
}
