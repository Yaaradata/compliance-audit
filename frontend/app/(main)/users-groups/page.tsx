"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { getRoleLabel } from "@/lib/data/roles";
import { PasswordInput } from "@/components/ui/password-input";
import type { UserRole } from "@/lib/types";

// ─── Types ───
export interface ComplianceUser {
  id: string;
  email: string;
  name: string;
  role: string | null;
  group_name: string | null;
  is_external?: boolean;
}

interface LocalGroup {
  id: string;
  name: string;
  color: string;
}

interface NewUserForm {
  email: string;
  name: string;
  password: string;
  is_external: boolean;
  group_name: string | null;
}

// ─── Constants ───
/** Display labels for roles. */
const ROLE_DISPLAY: Record<string, string> = {
  it_sme: "IT Expert",
  internal_reviewer_l1: "L1",
  internal_reviewer_l2: "L2",
  external_assessor: "Approver",
  compliance_officer: "Compliance Officer",
  tenant_admin: "Tenant Admin",
};

function getRoleDisplayLabel(role: string | null): string {
  if (!role) return "Assigned per cycle";
  return ROLE_DISPLAY[role] ?? getRoleLabel(role as UserRole) ?? "Assigned per cycle";
}

const GROUP_COLORS = ["#1f4e79", "#0284c7", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#4f46e5"];

const emptyUserForm: NewUserForm = {
  email: "",
  name: "",
  password: "",
  is_external: false,
  group_name: null,
};

// ─── Icons (theme-aware) ───
const IconPlus = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconGroup = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinejoin="round" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinejoin="round" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinejoin="round" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinejoin="round" />
  </svg>
);
const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 text-foreground-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth={2} />
    <path strokeWidth={2} strokeLinecap="round" d="M21 21l-4.35-4.35" />
  </svg>
);
const IconUpload = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ─── Helpers ───
function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = ["#1f4e79", "#0284c7", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#4f46e5"];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (name || "").charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function roleBadgeStyle(role: string | null): { bg: string; text: string; border: string } {
  if (!role) return { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" };
  if (role.includes("compliance") || role.includes("Compliance")) return { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
  if (role.includes("l1") || role.includes("L1")) return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
  if (role.includes("l2") || role.includes("L2")) return { bg: "#faf5ff", text: "#7c3aed", border: "#ddd6fe" };
  if (role.includes("external") || role.includes("L3")) return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
  if (role.includes("it_sme") || role.includes("IT")) return { bg: "#f0f9ff", text: "#0284c7", border: "#bae6fd" };
  if (role.includes("admin") || role.includes("Admin")) return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
  return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
}

// ─── Toast ───
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--primary)";
  return (
    <div
      className="fixed bottom-7 right-7 z-9999 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-lg"
      style={{ background: bg }}
      role="status"
    >
      {type === "success" && <IconCheck />}
      {message}
    </div>
  );
}

// ─── Field ───
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:border-(--primary)/60 focus:shadow-[0_0_0_3px_rgba(31,78,121,0.12)] focus:ring-0";

const filterInputBase =
  "h-10 rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-foreground placeholder:text-foreground-subtle outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:border-(--primary)/60 focus:shadow-[0_0_0_3px_rgba(31,78,121,0.12)] focus:ring-0 appearance-none cursor-pointer";

export default function UsersGroupsPage() {
  const router = useRouter();
  const { user, isPlatformAdmin } = useAuth();
  const [users, setUsers] = useState<ComplianceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"users" | "groups">("users");
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<ComplianceUser | null>(null);
  const deleteUserDialogTitleId = useId();
  const [userForm, setUserForm] = useState<NewUserForm>(emptyUserForm);
  const [groupForm, setGroupForm] = useState({ name: "", color: GROUP_COLORS[0], selectedUserIds: [] as string[] });
  const [groupFormUserSearch, setGroupFormUserSearch] = useState("");
  const [groupFormDropdownOpen, setGroupFormDropdownOpen] = useState(false);
  const groupFormDropdownRef = useRef<HTMLDivElement>(null);
  const [localGroups, setLocalGroups] = useState<LocalGroup[]>([]);
  const nextGroupId = useRef(1);

  const canAccess = user?.role === "compliance_officer" || user?.role === "tenant_admin";

  useEffect(() => {
    if (!userToDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserToDelete(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [userToDelete]);

  const fetchUsers = useCallback(() => {
    if (!canAccess) return;
    setLoading(true);
    api
      .get<ComplianceUser[]>("/compliance/users")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [canAccess]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isPlatformAdmin) {
      router.replace("/admin");
      return;
    }
    if (!canAccess) {
      router.replace("/dashboard");
      return;
    }
    fetchUsers();
  }, [user, isPlatformAdmin, canAccess, router, fetchUsers]);

  const notify = (message: string, type: "success" | "error" | "info" = "success") => setToast({ message, type });

  const distinctGroupNames = useMemo(
    () => Array.from(new Set(users.map((u) => u.group_name).filter((g): g is string => !!g))),
    [users]
  );

  const groupsDisplay = useMemo(() => {
    const fromApi = distinctGroupNames.filter((name) => !localGroups.some((g) => g.name === name));
    const apiGroups: LocalGroup[] = fromApi.map((name, i) => ({
      id: `api-${name}`,
      name,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
    }));
    return [...localGroups, ...apiGroups];
  }, [distinctGroupNames, localGroups]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchGroup =
        !filterGroup ||
        (filterGroup === "__unassigned__" ? !u.group_name : u.group_name === filterGroup);
      return matchSearch && matchGroup;
    });
  }, [users, search, filterGroup]);

  const handleAssignGroup = async (userId: string, groupName: string | null) => {
    setUpdatingId(userId);
    setError("");
    try {
      const value = groupName && groupName.trim() ? groupName.trim() : null;
      const updated = await api.patch<ComplianceUser>(`/compliance/users/${userId}`, { group_name: value });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      notify(value ? `Assigned to ${value}` : "Removed from group", "success");
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Failed to update group";
      setError(msg);
      notify(msg, "error");
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (target: ComplianceUser) => {
    setUserToDelete(null);
    setUpdatingId(target.id);
    setError("");
    try {
      await api.deleteUser(`/compliance/users/${target.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setError("");  // Clear any prior error
      notify(`${target.name || target.email} deleted`);
      fetchUsers();  // Refresh to ensure list is in sync with server
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Failed to delete user";
      setError(msg);
      notify(msg, "error");
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleExternal = async (userId: string, isExternal: boolean) => {
    setUpdatingId(userId);
    setError("");
    try {
      const updated = await api.patch<ComplianceUser>(`/compliance/users/${userId}`, { is_external: isExternal });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      notify(isExternal ? "Marked as external (L3 eligible)" : "Marked as internal", "success");
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Failed to update";
      setError(msg);
      notify(msg, "error");
      fetchUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userForm.email.trim() || userForm.password.length < 8) {
      setError("Email and password (min 8 characters) are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post<ComplianceUser>("/compliance/users", {
        email: userForm.email.trim().toLowerCase(),
        name: (userForm.name || userForm.email).trim(),
        password: userForm.password,
        is_external: userForm.is_external,
        group_name: userForm.group_name?.trim() || null,
      });
      fetchUsers();
      setShowAddUser(false);
      setUserForm(emptyUserForm);
      notify(`${userForm.name || userForm.email} added successfully`);
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Failed to create user";
      setError(msg);
      notify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkAdd = async (rows: { name: string; email: string; password: string; is_external: boolean; group: string }[]) => {
    const valid = rows.filter((r) => r.name.trim() && r.email.trim() && r.password.length >= 8);
    if (valid.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      for (const r of valid) {
        await api.post<ComplianceUser>("/compliance/users", {
          email: r.email.trim().toLowerCase(),
          name: r.name.trim() || r.email.trim(),
          password: r.password,
          is_external: r.is_external,
          group_name: r.group?.trim() || null,
        });
      }
      fetchUsers();
      setShowBulkAdd(false);
      notify(`${valid.length} users added successfully`);
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Failed to add users";
      setError(msg);
      notify(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGroup = async () => {
    const name = groupForm.name.trim();
    if (!name) return;
    setError("");
    setSubmitting(true);
    try {
      setLocalGroups((prev) => [...prev, { id: `local-${nextGroupId.current++}`, name, color: groupForm.color }]);
      for (const userId of groupForm.selectedUserIds) {
        await api.patch<ComplianceUser>(`/compliance/users/${userId}`, { group_name: name });
      }
      fetchUsers();
      setGroupForm({ name: "", color: GROUP_COLORS[0], selectedUserIds: [] });
      setGroupFormUserSearch("");
      setGroupFormDropdownOpen(false);
      setShowCreateGroup(false);
      const count = groupForm.selectedUserIds.length;
      notify(
        count > 0
          ? `Group "${name}" created with ${count} user${count !== 1 ? "s" : ""} assigned.`
          : `Group "${name}" created. You can assign users from the Users tab.`
      );
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Failed to create group or assign users";
      setError(msg);
      notify(msg, "error");
      fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGroupFormUser = (userId: string) => {
    setGroupForm((f) => ({
      ...f,
      selectedUserIds: f.selectedUserIds.includes(userId)
        ? f.selectedUserIds.filter((id) => id !== userId)
        : [...f.selectedUserIds, userId],
    }));
  };

  const removeGroupFormUser = (userId: string) => {
    setGroupForm((f) => ({ ...f, selectedUserIds: f.selectedUserIds.filter((id) => id !== userId) }));
  };

  const groupFormFilteredUsers = useMemo(() => {
    if (!groupFormUserSearch.trim()) return users;
    const q = groupFormUserSearch.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, groupFormUserSearch]);

  useEffect(() => {
    if (!showCreateGroup || !groupFormDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (groupFormDropdownRef.current && !groupFormDropdownRef.current.contains(e.target as Node)) {
        setGroupFormDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCreateGroup, groupFormDropdownOpen]);

  /**
   * Delete group only. Users in the group are kept but unassigned (group_name set to null).
   * Does not delete user accounts.
   */
  const handleDeleteGroup = async (groupName: string) => {
    const members = users.filter((u) => u.group_name === groupName);
    const confirmMsg =
      members.length > 0
        ? `Delete group "${groupName}"? ${members.length} user(s) will be unassigned but not removed.`
        : `Delete group "${groupName}"?`;
    if (!window.confirm(confirmMsg)) return;

    setError("");
    try {
      for (const u of members) {
        await api.patch<ComplianceUser>(`/compliance/users/${u.id}`, { group_name: null });
      }
      setLocalGroups((prev) => prev.filter((g) => g.name !== groupName));
      fetchUsers();
      notify(`Group "${groupName}" deleted. ${members.length > 0 ? "Users unassigned." : ""}`);
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Failed to delete group";
      setError(msg);
      notify(msg, "error");
      fetchUsers();
    }
  };

  if (!user || !canAccess) return null;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, var(--background) 0%, var(--muted) 50%, var(--background) 100%)",
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Users & Groups</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage team members and organize them into groups. Roles are assigned per audit cycle.
          </p>
        </header>

        {/* Stats — soft elevation, no harsh borders */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Users", value: users.length },
            { label: "Groups", value: groupsDisplay.length },
            { label: "Assigned", value: users.filter((u) => u.group_name).length },
            { label: "Unassigned", value: users.filter((u) => !u.group_name).length },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.03)]"
            >
              <div className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: "var(--font-geist-sans)" }}>
                {s.value}
              </div>
              <div className="mt-0.5 text-xs font-medium text-foreground-muted tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-2xl bg-slate-100/80 p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setTab("users")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                tab === "users"
                  ? "bg-(--primary) text-white shadow-[0_2px_6px_rgba(31,78,121,0.35)]"
                  : "text-foreground-muted hover:text-foreground hover:bg-slate-200/60"
              }`}
            >
              <IconUsers />
              Users
            </button>
            <button
              type="button"
              onClick={() => setTab("groups")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                tab === "groups"
                  ? "bg-[#7c3aed] text-white shadow-[0_2px_6px_rgba(124,58,237,0.35)]"
                  : "text-foreground-muted hover:text-foreground hover:bg-slate-200/60"
              }`}
            >
              <IconGroup />
              Groups
            </button>
          </div>
          <div className="flex gap-2">
            {tab === "users" && (
              <>
                <button
                  type="button"
                  onClick={() => setShowBulkAdd(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                >
                  <IconUpload />
                  Bulk Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddUser(true); setError(""); }}
                  className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-[0_2px_6px_rgba(31,78,121,0.25)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--primary)/40"
                >
                  <IconPlus />
                  Add User
                </button>
              </>
            )}
            {tab === "groups" && (
              <button
                type="button"
                onClick={() => setShowCreateGroup(true)}
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-[0_2px_6px_rgba(31,78,121,0.25)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--primary)/40"
              >
                <IconPlus />
                Create Group
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {error}
          </div>
        )}

        {/* Delete user — confirm in a portal so it always stacks above the page chrome */}
        {userToDelete &&
          createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
              role="presentation"
              onClick={() => setUserToDelete(null)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={deleteUserDialogTitleId}
                className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 id={deleteUserDialogTitleId} className="text-lg font-bold text-foreground mb-2">
                  Delete this user?
                </h3>
                <p className="text-sm text-foreground-muted mb-4">
                  You are about to permanently remove{" "}
                  <strong>{userToDelete.name || userToDelete.email}</strong> ({userToDelete.email}). This cannot be undone
                  and will remove them from all cycle assignments and related records.
                </p>
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setUserToDelete(null)}
                    className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(userToDelete)}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    Delete user
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Users tab */}
        {tab === "users" && (
          <>
            {/* Add User — inline section, solid background */}
            {showAddUser && (
              <div className="mb-6 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-0">
                  <Field label="Full Name" required>
                    <input
                      value={userForm.name}
                      onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Enter full name"
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Email Address" required>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="user@domain.com"
                      className={inputBase}
                    />
                  </Field>
                  <Field label="Password" required>
                    <PasswordInput
                      value={userForm.password}
                      onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min 8 characters"
                      className={inputBase}
                    />
                  </Field>
                  <Field label="External assessor">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.is_external}
                        onChange={(e) => setUserForm((f) => ({ ...f, is_external: e.target.checked }))}
                        className="rounded border-slate-300 text-(--primary) focus:ring-(--primary)/40"
                      />
                      <span className="text-sm text-foreground">Eligible for L3/Approver role (assign per cycle)</span>
                    </label>
                  </Field>
                  <Field label="Group">
                    <select
                      value={userForm.group_name ?? ""}
                      onChange={(e) => setUserForm((f) => ({ ...f, group_name: e.target.value || null }))}
                      className={inputBase}
                    >
                      <option value="">No group</option>
                      {groupsDisplay.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="rounded-xl bg-slate-100/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-slate-200/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || userForm.password.length < 8}
                      className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                    >
                      <IconPlus />
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bulk Add — inline section */}
            {showBulkAdd && (
              <BulkAddInline
                onClose={() => setShowBulkAdd(false)}
                groups={groupsDisplay}
                onBulkAdd={handleBulkAdd}
                submitting={submitting}
                inputBase={inputBase}
              />
            )}

            <div className="mb-4 flex flex-nowrap items-center gap-3 overflow-x-auto pb-1">
              <div className="relative min-w-0 flex-1 max-w-[320px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-subtle flex items-center">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className={`${filterInputBase} w-full pl-9 pr-4 cursor-text`}
                />
              </div>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className={`${filterInputBase} shrink-0 w-[130px] pl-4 pr-9 bg-size-[12px] bg-position-[right_0.75rem_center] bg-no-repeat`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
              >
                <option value="">All Groups</option>
                <option value="__unassigned__">Unassigned</option>
                {groupsDisplay.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
              {loading ? (
                <div className="divide-y divide-slate-50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 px-5 py-4">
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-muted/60 animate-pulse" />
                      <div className="h-4 flex-1 max-w-[200px] rounded-lg bg-muted/60 animate-pulse" />
                      <div className="h-4 w-28 rounded-lg bg-muted/60 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-sm text-foreground-muted bg-slate-50/80">
                  No users match your filters. Try changing search or filters, or add users.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/90">
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                          User
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                          Email
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                          Role
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                          Group
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted" title="External assessor (L3 eligible)">
                          Ext
                        </th>
                        {canAccess && (
                          <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, idx) => {
                        const rc = roleBadgeStyle(u.role);
                        return (
                          <tr
                            key={u.id}
                            className="transition-colors hover:bg-slate-50/70"
                            style={idx > 0 ? { borderTop: "1px solid rgba(226,232,240,0.8)" } : undefined}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                                  style={{ background: getAvatarColor(u.name || u.email) }}
                                >
                                  {getInitials(u.name || u.email)}
                                </div>
                                <span className="font-medium text-foreground">{u.name || "—"}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-foreground-muted">{u.email}</td>
                            <td className="px-5 py-4">
                              <span
                                className="inline-block rounded-full px-3 py-1 text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                                style={{ background: rc.bg, color: rc.text }}
                              >
                                {getRoleDisplayLabel(u.role)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <select
                                value={u.group_name ?? ""}
                                onChange={(e) => handleAssignGroup(u.id, e.target.value || null)}
                                disabled={updatingId === u.id}
                                className={`${inputBase} min-w-[140px] py-2 disabled:opacity-60`}
                              >
                                <option value="">No group</option>
                                {groupsDisplay.map((g) => (
                                  <option key={g.id} value={g.name}>
                                    {g.name}
                                  </option>
                                ))}
                              </select>
                              {updatingId === u.id && (
                                <span className="ml-2 text-xs text-foreground-muted">Updating…</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => handleToggleExternal(u.id, !u.is_external)}
                                disabled={updatingId === u.id}
                                title={u.is_external ? "External (L3 eligible). Click to mark internal." : "Internal. Click to mark external (L3 eligible)."}
                                className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                                  u.is_external ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {u.is_external ? "EXT" : "—"}
                              </button>
                            </td>
                            {canAccess && (
                              <td className="px-5 py-4 text-right">
                                {u.id !== user?.id && (
                                  <button
                                    type="button"
                                    onClick={() => setUserToDelete(u)}
                                    disabled={updatingId === u.id}
                                    title="Delete user"
                                    className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-60"
                                  >
                                    <IconTrash />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && users.length > 0 && (
                <div className="px-5 py-3 text-right text-xs text-foreground-muted bg-slate-50/80">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              )}
            </div>
          </>
        )}

        {/* Groups tab */}
        {tab === "groups" && (
          <>
            {/* Create Group — inline section, solid background */}
            {showCreateGroup && (
              <div className="mb-6 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Create Group</h3>
                <Field label="Group Name" required>
                  <input
                    value={groupForm.name}
                    onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. IT Security Team"
                    className={inputBase}
                  />
                </Field>
                <Field label="Color">
                  <div className="flex flex-wrap gap-2">
                    {GROUP_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setGroupForm((f) => ({ ...f, color: c }))}
                        className="h-9 w-9 rounded-xl border-2 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                        style={{
                          background: c,
                          borderColor: groupForm.color === c ? "rgba(15,23,42,0.5)" : "transparent",
                        }}
                      >
                        {groupForm.color === c && (
                          <span className="flex h-full w-full items-center justify-center text-white">
                            <IconCheck />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Add users to this group">
                  <p className="mb-3 text-xs text-foreground-muted">
                    Type to search and select users from the list. Only selected users are added to the group.
                  </p>
                  <div className="relative" ref={groupFormDropdownRef}>
                    <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200/90 bg-white pl-3.5 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all focus-within:border-(--primary)/60 focus-within:shadow-[0_0_0_3px_rgba(31,78,121,0.12)]">
                      <span className="text-foreground-subtle shrink-0"><IconSearch /></span>
                      <input
                        type="text"
                        value={groupFormUserSearch}
                        onChange={(e) => setGroupFormUserSearch(e.target.value)}
                        onFocus={() => setGroupFormDropdownOpen(true)}
                        placeholder="Search and select users…"
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
                      />
                    </div>
                    {groupFormDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.06)] border border-slate-200/80">
                        <div className="max-h-[220px] overflow-y-auto p-2">
                          {groupFormFilteredUsers.length === 0 ? (
                            <p className="py-4 text-center text-sm text-foreground-muted">
                              {users.length === 0 ? "No users yet." : "No users match your search."}
                            </p>
                          ) : (
                            <ul className="space-y-0.5">
                              {groupFormFilteredUsers.map((u) => {
                                const selected = groupForm.selectedUserIds.includes(u.id);
                                return (
                                  <li key={u.id}>
                                    <button
                                      type="button"
                                      onClick={() => toggleGroupFormUser(u.id)}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                                    >
                                      <div
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                                        style={{ background: getAvatarColor(u.name || u.email) }}
                                      >
                                        {getInitials(u.name || u.email)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-foreground">{u.name || "—"}</span>
                                        <span className="block truncate text-xs text-foreground-muted">{u.email}</span>
                                      </div>
                                      {selected && (
                                        <span className="shrink-0 text-(--primary)">
                                          <IconCheck />
                                        </span>
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {groupForm.selectedUserIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {groupForm.selectedUserIds.map((id) => {
                        const u = users.find((x) => x.id === id);
                        if (!u) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 py-1.5 pl-2.5 pr-1.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                          >
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{ background: getAvatarColor(u.name || u.email) }}
                            >
                              {getInitials(u.name || u.email)}
                            </span>
                            <span className="truncate max-w-[140px] text-foreground">{u.name || u.email}</span>
                            <button
                              type="button"
                              onClick={() => removeGroupFormUser(id)}
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-slate-200/80 hover:text-foreground"
                              aria-label="Remove"
                            >
                              <IconX />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </Field>
                <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                      setShowCreateGroup(false);
                      setGroupForm({ name: "", color: GROUP_COLORS[0], selectedUserIds: [] });
                      setGroupFormUserSearch("");
                      setGroupFormDropdownOpen(false);
                    }}
                    className="rounded-xl bg-slate-100/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-slate-200/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateGroup}
                    disabled={!groupForm.name.trim() || submitting}
                    className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                  >
                    <IconPlus />
                    Create Group
                    {groupForm.selectedUserIds.length > 0 && ` (${groupForm.selectedUserIds.length})`}
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groupsDisplay.map((g) => {
              const members = users.filter((u) => u.group_name === g.name);
              return (
                <div
                  key={g.id}
                  className="rounded-2xl bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: `${g.color}18` }}
                      >
                        <div className="h-4 w-4 rounded-md" style={{ background: g.color }} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{g.name}</div>
                        <div className="text-xs text-foreground-muted">
                          {members.length} member{members.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(g.name)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-danger-bg hover:text-danger"
                      title="Delete group only; users will be unassigned, not removed"
                    >
                      <IconTrash />
                      <span className="hidden sm:inline">Delete group</span>
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 px-5 py-3">
                    {members.length === 0 ? (
                      <div className="py-4 text-center text-sm italic text-foreground-subtle">No members yet</div>
                    ) : (
                      members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 py-2.5">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ background: getAvatarColor(m.name || m.email) }}
                          >
                            {getInitials(m.name || m.email)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">{m.name || "—"}</div>
                            <div className="truncate text-xs text-foreground-muted">
                              {getRoleDisplayLabel(m.role)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
            {groupsDisplay.length === 0 && (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200/80 bg-white/90 py-16 text-center text-sm text-foreground-muted shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                No groups yet. Create a group, then assign users from the Users tab.
              </div>
            )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Bulk Add Inline (solid card, no overlay) ───
function BulkAddInline({
  onClose,
  groups,
  onBulkAdd,
  submitting,
  inputBase,
}: {
  onClose: () => void;
  groups: LocalGroup[];
  onBulkAdd: (rows: { name: string; email: string; password: string; is_external: boolean; group: string }[]) => void;
  submitting: boolean;
  inputBase: string;
}) {
  const [defaultIsExternal, setDefaultIsExternal] = useState(false);
  const [rows, setRows] = useState([
    { name: "", email: "", password: "", group: "" },
    { name: "", email: "", password: "", group: "" },
    { name: "", email: "", password: "", group: "" },
  ]);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const updateRow = (i: number, field: string, val: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  };

  const addRow = () =>
    setRows((prev) => [...prev, { name: "", email: "", password: "", group: "" }]);

  const removeRow = (i: number) => setRows((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));

  const handleSubmit = () => {
    const valid = rows.filter((r) => r.name.trim() && r.email.trim() && r.password.length >= 8);
    if (valid.length === 0) return;
    onBulkAdd(valid.map((r) => ({ ...r, is_external: defaultIsExternal })));
    setRows([
      { name: "", email: "", password: "", group: "" },
      { name: "", email: "", password: "", group: "" },
      { name: "", email: "", password: "", group: "" },
    ]);
    setShowPasswords({});
    onClose();
  };

  const validCount = rows.filter((r) => r.name.trim() && r.email.trim() && r.password.length >= 8).length;

  return (
    <div className="mb-6 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground">Bulk Add Users</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <IconX />
        </button>
      </div>
      <p className="mb-5 text-sm text-foreground-muted">
        Add multiple users at once. Fill in name, email, and password (min 8 characters) for each row.
      </p>
      <div className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={defaultIsExternal}
            onChange={(e) => setDefaultIsExternal(e.target.checked)}
            className="rounded border-slate-300 text-[#1f4e79] focus:ring-[#1f4e79]"
          />
          <span className="text-sm font-medium text-foreground">External assessor (eligible for L3) for all</span>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <th className="w-8 pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">Name *</th>
              <th className="pb-2 pr-2">Email *</th>
              <th className="pb-2 pr-2">Password *</th>
              <th className="pb-2 pr-2">Group</th>
              <th className="w-10 pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={i > 0 ? { borderTop: "1px solid rgba(226,232,240,0.8)" } : undefined}>
                <td className="py-2 pr-2 text-center text-foreground-subtle">{i + 1}</td>
                <td className="py-1 pr-2">
                  <input
                    value={row.name}
                    onChange={(e) => updateRow(i, "name", e.target.value)}
                    placeholder="Name"
                    className={`${inputBase} py-2 text-xs`}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(i, "email", e.target.value)}
                    placeholder="email@domain.com"
                    className={`${inputBase} py-2 text-xs`}
                  />
                </td>
                <td className="py-1 pr-2">
                  <div className="relative">
                    <input
                      value={row.password}
                      onChange={(e) => updateRow(i, "password", e.target.value)}
                      type={showPasswords[i] ? "text" : "password"}
                      placeholder="Min 8 chars"
                      className={`${inputBase} py-2 pr-9 text-xs`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, [i]: !p[i] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
                    >
                      {showPasswords[i] ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth={1.8} strokeLinecap="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth={1.8} strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeWidth={1.8} strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-1 pr-2">
                  <select
                    value={row.group}
                    onChange={(e) => updateRow(i, "group", e.target.value)}
                    className={`${inputBase} py-2 text-xs`}
                  >
                    <option value="">No group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="rounded p-1.5 text-foreground-subtle hover:bg-danger-bg hover:text-danger"
                  >
                    <IconTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-slate-200/80 hover:text-foreground"
      >
        <IconPlus />
        Add another row
      </button>
      <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-slate-200/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || validCount === 0}
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          <IconCheck />
          Add {validCount} user{validCount !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}
