"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  Activity,
  Bell,
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
      className={cn("sticky top-0 hidden h-dvh shrink-0 md:flex")}
      style={{
        width: 240,
        background: "var(--bg-sidebar)",
        boxShadow: "var(--shadow-sidebar)",
        padding: "32px 0",
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
      {/* En-tête */}
      <div style={{ padding: "0 24px 32px" }}>
        <Link
          href="/"
          onClick={() => params?.onNavigate?.()}
          className="no-underline"
          style={{ display: "block", textDecoration: "none" }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 18,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            ✦ SEPHORA
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "var(--font-body)",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: "var(--s-rose)",
              opacity: 0.75,
              textTransform: "uppercase",
            }}
          >
            Intelligence Stratégique
          </div>
        </Link>
      </div>

      <nav className="mt-7 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <Link
                href={item.href}
                onClick={() => params?.onNavigate?.()}
                className={cn(
                  "group relative flex items-center gap-3 transition-all duration-200",
                  "bg-transparent text-[rgba(255,255,255,0.45)] group-hover:bg-[rgba(255,255,255,0.06)] group-hover:text-[rgba(255,255,255,0.85)]",
                )}
                style={{
                  padding: "11px 24px",
                  borderRadius: "0 14px 14px 0",
                  marginRight: 16,
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 500,
                  background: active
                    ? "linear-gradient(135deg, rgba(196,99,122,0.25), rgba(201,169,110,0.12))"
                    : undefined,
                  color: active ? "#FFFFFF" : undefined,
                  borderLeft: active ? "2px solid var(--s-rose-deep)" : "2px solid transparent",
                  paddingLeft: active ? 22 : 24,
                }}
              >
                <Icon
                  className="size-[18px] text-current transition-all duration-200 group-hover:drop-shadow-[0_0_12px_rgba(196,99,122,0.35)]"
                  style={{ flex: "0 0 auto" }}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            className="live-dot"
            style={{
              width: 7,
              height: 7,
              background: "#3DB87A",
              borderRadius: "50%",
              display: "inline-block",
              marginRight: 8,
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
      </div>
    </>
  );
}

