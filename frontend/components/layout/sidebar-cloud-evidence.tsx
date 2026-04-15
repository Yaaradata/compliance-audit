"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IconAWS, IconAzure, IconGCP, IconLayers } from "@/components/layout/sidebar-nav-icons";

const CLOSE_DELAY_MS = 220;

export function SidebarCloudEvidence(props: {
  label: string;
  sidebarOpen: boolean;
  hoverEnabled: boolean;
  awsHref: string;
  gcpHref: string;
  azureHref: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const { label, sidebarOpen, hoverEnabled, awsHref, gcpHref, azureHref, onOpenChange } = props;
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 220 });

  const commitOpen = useCallback(
    (next: boolean) => {
      setVisible(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  const updateCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({ top: r.bottom + 8, left: r.left, width: Math.max(220, r.width) });
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      commitOpen(false);
    }, CLOSE_DELAY_MS);
  }, [cancelClose, commitOpen]);

  const openPanel = useCallback(() => {
    cancelClose();
    requestAnimationFrame(() => {
      updateCoords();
      commitOpen(true);
    });
  }, [cancelClose, commitOpen, updateCoords]);

  useEffect(() => {
    return () => {
      onOpenChange?.(false);
    };
  }, [onOpenChange]);

  useEffect(() => {
    if (!visible) return;
    updateCoords();
    const onScrollOrResize = () => updateCoords();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [visible, updateCoords]);

  useEffect(() => {
    if (!visible || hoverEnabled) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      commitOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [visible, hoverEnabled, commitOpen]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") commitOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, commitOpen]);

  const isAwsActive = Boolean(pathname?.startsWith("/aws"));
  const isGcpActive = Boolean(pathname?.startsWith("/gcp"));
  const isAzureActive = Boolean(pathname?.startsWith("/azure"));
  const isParentActive = isAwsActive || isGcpActive || isAzureActive;

  const triggerCls = `flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium outline-none transition-all duration-200 hover:bg-(--sidebar-hover) focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--sidebar-active-text) min-w-0 border-0 cursor-pointer text-left ${
    sidebarOpen ? "px-3" : "px-3 justify-center"
  }`;

  const linkCls =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 min-w-0 hover:bg-(--sidebar-hover) focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--sidebar-active-text) hover:shadow-[0_0_22px_rgba(125,211,252,0.18),0_0_0_1px_rgba(125,211,252,0.12)]";

  return (
    <>
      <div
        ref={triggerRef}
        className="relative"
        onMouseEnter={() => hoverEnabled && openPanel()}
        onMouseLeave={() => hoverEnabled && scheduleClose()}
      >
        <button
          type="button"
          className={triggerCls}
          style={{
            color: isParentActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-muted)",
            backgroundColor: isParentActive && !visible ? "var(--sidebar-active-bg)" : "transparent",
            boxShadow:
              visible && !hoverEnabled
                ? "0 0 0 1px color-mix(in srgb, var(--sidebar-active-text) 35%, transparent), 0 0 20px rgba(125,211,252,0.12)"
                : undefined,
          }}
          title={!sidebarOpen ? label : undefined}
          aria-haspopup="menu"
          aria-expanded={visible}
          onClick={() => {
            if (hoverEnabled) return;
            if (visible) {
              cancelClose();
              commitOpen(false);
            } else {
              openPanel();
            }
          }}
        >
          <span style={{ color: "inherit" }}>
            <IconLayers className="w-5 h-5" />
          </span>
          {sidebarOpen && (
            <>
              <span className="truncate flex-1">{label}</span>
              {!hoverEnabled && (
                <svg
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${visible ? "rotate-180" : ""}`}
                  style={{ color: "var(--sidebar-text-muted)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {visible && (
          <motion.div
            ref={panelRef}
            role="menu"
            aria-label="Cloud evidence providers"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed z-[60] flex flex-col gap-1 rounded-xl p-2 border"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              background: "var(--sidebar-bg)",
              borderColor: "color-mix(in srgb, var(--sidebar-border) 80%, var(--sidebar-active-text))",
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(125,211,252,0.08), 0 0 32px rgba(59,130,246,0.08)",
            }}
            onMouseEnter={() => {
              if (hoverEnabled) {
                cancelClose();
                commitOpen(true);
              }
            }}
            onMouseLeave={() => hoverEnabled && scheduleClose()}
          >
            <Link
              role="menuitem"
              href={awsHref}
              className={linkCls}
              style={{
                color: isAwsActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-muted)",
                backgroundColor: isAwsActive ? "var(--sidebar-active-bg)" : "transparent",
              }}
              onClick={() => commitOpen(false)}
            >
              <span style={{ color: "inherit" }}>
                <IconAWS className="w-5 h-5" />
              </span>
              <span className="truncate">AWS Evidence</span>
            </Link>
            <Link
              role="menuitem"
              href={gcpHref}
              className={linkCls}
              style={{
                color: isGcpActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-muted)",
                backgroundColor: isGcpActive ? "var(--sidebar-active-bg)" : "transparent",
              }}
              onClick={() => commitOpen(false)}
            >
              <span style={{ color: "inherit" }}>
                <IconGCP className="w-5 h-5" />
              </span>
              <span className="truncate">GCP Evidence</span>
            </Link>
            <Link
              role="menuitem"
              href={azureHref}
              className={linkCls}
              style={{
                color: isAzureActive ? "var(--sidebar-active-text)" : "var(--sidebar-text-muted)",
                backgroundColor: isAzureActive ? "var(--sidebar-active-bg)" : "transparent",
              }}
              onClick={() => commitOpen(false)}
            >
              <span style={{ color: "inherit" }}>
                <IconAzure className="w-5 h-5" />
              </span>
              <span className="truncate">Azure Evidence</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
