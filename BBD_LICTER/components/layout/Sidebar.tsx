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
        "sticky top-0 hidden h-dvh w-[240px] shrink-0 border-r border-black/10 bg-white md:block",
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
        <Link
          href="/"
          onClick={() => params?.onNavigate?.()}
          className="flex items-center gap-2 px-0 no-underline"
        >
          <div className="grid size-9 place-items-center rounded-sm bg-white ring-1 ring-black/10">
            <ChartNoAxesCombined className="size-5 text-black" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-extrabold tracking-tight text-black">
              SEPHORA Intel
            </div>
            <div className="text-xs text-text-secondary">Brand & Market Intelligence</div>
          </div>
        </Link>
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
                "group relative flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-all duration-300",
                active
                  ? "text-black font-bold"
                  : "text-black/70 hover:bg-black/3 hover:text-black",
              )}
            >
              {active ? (
                <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#FDC9D3]" />
              ) : null}
              <Icon className="size-[18px] text-current transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(253,201,211,0.55)]" />
              <span className="truncate">{item.label}</span>
              {active && item.label === "Vue d'ensemble" ? (
                <span className="pointer-events-none absolute bottom-1 left-3 right-3 h-[2px] bg-[#FDC9D3]" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pb-2 pt-6">
        <div className="rounded-sm border border-black/10 bg-white px-3 py-3 transition-all duration-300 hover:border-[#FDC9D3]">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
            Données en temps réel
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            <span className="relative inline-flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-[#FF00ED]/40" />
              <span className="relative inline-flex size-2 rounded-full bg-[#FF00ED]" />
            </span>
            <span className="font-light text-[#FF00ED]">Système en ligne</span>
          </div>
        </div>
      </div>
    </>
  );
}

