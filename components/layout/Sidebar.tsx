"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  Activity,
  Bell,
  Crosshair,
  Home,
  MessageCircle,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: Home },
  { href: "/reputation", label: "Réputation", icon: Activity },
  { href: "/concurrence", label: "Concurrence", icon: Crosshair },
  { href: "/experience", label: "Expérience Client", icon: MessageCircle },
  { href: "/next-best-actions", label: "Next Best Actions", icon: Zap },
  { href: "/alertes", label: "Alertes", icon: Bell },
] as const;

export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("sticky top-0 hidden h-dvh shrink-0 md:flex")}
      style={{
        width: 260,
        background: "#000000",
        boxShadow: "var(--shadow-sidebar)",
        padding: "0",
        flexDirection: "column",
      }}
    >
      <SidebarContent />
    </motion.aside>
  );
}

export function SidebarContent(params?: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo Sephora */}
      <div className="px-6 pt-8 pb-6">
        <Link
          href="/"
          onClick={() => params?.onNavigate?.()}
          className="no-underline"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/Couleur-logo-Sephora.jpg"
              alt="Sephora"
              width={170}
              height={52}
              priority
              style={{ height: 34, width: "auto" }}
            />
            <div className="pl-1">
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  color: "#C9A96E",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Intelligence Platform
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Separator */}
      <div className="mx-6 h-px" style={{ background: "rgba(201,169,110,0.15)" }} />

      <nav className="mt-6 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isNBA = item.href === "/next-best-actions";

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <Link
                href={item.href}
                onClick={() => params?.onNavigate?.()}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                  active
                    ? "text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/80",
                )}
                style={{
                  padding: "10px 14px",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 500,
                  background: active
                    ? "linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))"
                    : undefined,
                  borderLeft: active ? "2px solid #C9A96E" : "2px solid transparent",
                }}
              >
                <div
                  className={cn(
                    "grid size-8 place-items-center rounded-lg transition-all",
                    active ? "bg-[#C9A96E]/10" : "bg-transparent",
                    isNBA && !active ? "bg-white/[0.04]" : "",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[16px] transition-all",
                      active ? "text-[#C9A96E]" : "text-current",
                      isNBA && !active ? "text-[#C9A96E]/60" : "",
                    )}
                  />
                </div>
                <span className="truncate">{item.label}</span>
                {isNBA && !active && (
                  <span className="ml-auto rounded bg-[#C9A96E]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#C9A96E]">
                    NEW
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <span
            className="live-dot"
            style={{
              width: 7,
              height: 7,
              background: "#22c55e",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 400,
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Données en temps réel
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#C9A96E]" />
          <span className="text-[10px] font-medium text-white/20">
            Sephora France — COMEX
          </span>
        </div>
      </div>
    </>
  );
}
