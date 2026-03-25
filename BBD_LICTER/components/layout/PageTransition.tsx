"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = Readonly<{
  children: ReactNode;
}>;

export function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }
        }
        className="min-w-0 flex-1 flex flex-col gap-6 p-8"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

