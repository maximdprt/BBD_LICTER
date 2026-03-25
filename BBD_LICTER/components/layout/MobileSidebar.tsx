"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { SidebarContent } from "@/components/layout/Sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-sm border border-black/10 bg-white px-3 py-2 text-sm font-semibold md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5 text-black" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 h-dvh w-[240px] px-4 py-5"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ background: "var(--bg-sidebar)", boxShadow: "var(--shadow-sidebar)" }}
            >
              <div className="flex items-center justify-between px-2">
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
                  Navigation
                </div>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-sm border border-white/10 bg-transparent"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X className="size-5 text-white/70" />
                </button>
              </div>

              <div className="mt-3 flex h-[calc(100dvh-64px)] flex-col">
                <SidebarContent onNavigate={() => setOpen(false)} />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

