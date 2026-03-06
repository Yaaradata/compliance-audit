"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

export interface NotificationItem {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
  actor_id: string | null;
  title: string | null;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const cycleId = pathname?.match(/\/cycles\/([^/]+)/)?.[1];

  const fetchUnread = () => {
    api.get<{ count: number }>("/notifications/unread-count").then((r) => setCount(r.count)).catch(() => setCount(0));
  };

  useEffect(() => {
    fetchUnread();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .get<NotificationItem[]>("/notifications?unread_only=false")
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [open]);

  const markRead = (id: string) => {
    api
      .patch(`/notifications/${id}/read`)
      .then(() => {
        setCount((c) => Math.max(0, c - 1));
        setList((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      })
      .catch(() => {
        // 404 = already read or deleted; still update UI so badge/list reflect optimistically
        setCount((c) => Math.max(0, c - 1));
        setList((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)));
      });
  };

  const hrefFor = (item: NotificationItem) => {
    if (item.resource_type === "evidence_submission" && cycleId) {
      return `/cycles/${cycleId}/review?sub=${item.resource_id}`;
    }
    if (item.resource_type === "review" && cycleId) return `/cycles/${cycleId}/review`;
    if (cycleId) return `/cycles/${cycleId}/dashboard`;
    return "/dashboard";
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
        aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50 py-1"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--foreground)]">Notifications</span>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    api.patch("/notifications/read-all").then(() => {
                      setCount(0);
                      setList((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
                    });
                  }}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            {loading ? (
              <p className="px-3 py-4 text-xs text-[var(--foreground-muted)]">Loading…</p>
            ) : list.length === 0 ? (
              <p className="px-3 py-4 text-xs text-[var(--foreground-muted)]">No notifications</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {list.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={hrefFor(n)}
                      onClick={() => {
                        if (!n.read_at) markRead(n.id);
                        setOpen(false);
                      }}
                      className="block px-3 py-2 hover:bg-[var(--background)] transition-colors"
                    >
                      <p className="text-xs font-medium text-[var(--foreground)]">{n.title ?? n.action}</p>
                      {n.body && <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-[var(--foreground-subtle)] mt-1">
                        {new Date(n.created_at).toLocaleString()}
                        {!n.read_at && <span className="ml-1 rounded-full bg-[var(--primary)] w-1.5 h-1.5 inline-block align-middle" />}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
