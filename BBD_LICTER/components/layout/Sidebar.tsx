"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  Crosshair,
  Home,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: Home },
  { href: "/reputation", label: "Réputation", icon: Activity },
  { href: "/concurrence", label: "Concurrence", icon: Crosshair },
  { href: "/experience", label: "Expérience Client", icon: MessageCircle },
  { href: "/alertes", label: "Alertes", icon: Bell },
] as const;

export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "sticky top-0 hidden h-dvh w-[240px] shrink-0 border-r border-border bg-white/70 backdrop-blur-sm md:block",
        "px-4 py-5",
      )}
    >
      <SidebarContent />
    </motion.aside>
  );
}

export function SidebarContent(params?: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-2 px-2">
        <div className="grid size-9 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <ChartNoAxesCombined className="size-5 text-accent" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-extrabold tracking-tight text-accent">
            SEPHORA Intel
          </div>
          <div className="text-xs text-text-secondary">Brand & Market Intelligence</div>
        </div>
      </div>

      <nav className="mt-7 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => params?.onNavigate?.()}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-foreground/80 hover:translate-x-1 hover:bg-accent/10 hover:text-accent",
              )}
            >
              {active ? (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-accent" />
              ) : null}
              <Icon className="size-[18px] text-current" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pb-2 pt-6">
        <div className="rounded-2xl border border-border bg-white/80 px-3 py-3 backdrop-blur-sm">
          <div className="text-xs font-semibold text-foreground">Données en temps réel</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            <span className="relative inline-flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-500/40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Supabase Realtime actif
          </div>
        </div>
      </div>
    </>
  );
}

