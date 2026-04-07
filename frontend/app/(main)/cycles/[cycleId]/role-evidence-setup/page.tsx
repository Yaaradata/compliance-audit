"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AssessmentCycle } from "@/lib/types";

interface ComplianceUser {
  id: string;
  email: string;
  name: string;
  role: string;
  group_name: string | null;
  is_external?: boolean;
}

interface RoleAssignment {
  id: string;
  role: string;
  assignment_type: string;
  group_name: string | null;
  user_id: string | null;
  role_start_date?: string | null;
  role_end_date?: string | null;
}

type RoleDateRanges = Record<string, { role_start_date: string | null; role_end_date: string | null }>;
type EvidenceDateRanges = Record<string, { evidence_start_date: string | null; evidence_end_date: string | null }>;

interface EvidenceItem {
  id: string;
  domain_id: string;
  name: string;
  priority: string;
}

interface EvidenceAssignment {
  id: string;
  evidence_item_id: string;
  assignment_type: string;
  group_name: string | null;
  user_id: string | null;
  evidence_start_date?: string | null;
  evidence_end_date?: string | null;
}

const ROLE_DEFS = [
  { id: "it_sme", label: "Evidence Collection", short: "Evidence Collection", desc: "Uploads and submits evidence", cardClass: "bg-blue-100 border border-blue-200" },
  { id: "internal_reviewer_l1", label: "L1", short: "L1", desc: "First-level review of evidence", cardClass: "bg-emerald-100 border border-emerald-200" },
  { id: "internal_reviewer_l2", label: "L2", short: "L2", desc: "Second-level review and validation", cardClass: "bg-violet-100 border border-violet-200" },
  { id: "external_assessor", label: "Approver", short: "Approver", desc: "Final independent approval (external only)", cardClass: "bg-amber-100 border border-amber-200" },
];

const DOMAIN_NAMES: Record<string, string> = {
  A: "Network & Architecture",
  B: "System Hardening",
  C: "Access Management",
  D: "Vulnerability & Patch",
  E: "Monitoring & Detection",
  F: "Third-Party",
  G: "Physical Security",
  H: "Policies & Governance",
};

const DOMAIN_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** SME users whose `group_name` is already assigned as a group — hide from Individuals to avoid duplicate coverage. */
function userIdsBelongingToAssignedGroups(users: ComplianceUser[], assignedGroupNames: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  if (assignedGroupNames.size === 0) return out;
  for (const u of users) {
    if (u.group_name && assignedGroupNames.has(u.group_name)) out.add(u.id);
  }
  return out;
}

export default function RoleEvidenceSetupPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;
  const { user, isPlatformAdmin, logout } = useAuth();

  const [cycle, setCycle] = useState<AssessmentCycle | null>(null);
  const [users, setUsers] = useState<ComplianceUser[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [evidenceAssignments, setEvidenceAssignments] = useState<EvidenceAssignment[]>([]);
  const [conflicts, setConflicts] = useState<{ uid: string; name: string; roles: string[]; msg: string }[]>([]);
  const [step, setStep] = useState<"roles" | "evidence">("roles");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [roleDateRanges, setRoleDateRanges] = useState<RoleDateRanges>({});
  const [evidenceDateRanges, setEvidenceDateRanges] = useState<EvidenceDateRanges>({});
  /** Default: domain rows (A–H). Switch to item-wise for per–evidence-item editing. */
  const [evidenceAssignmentView, setEvidenceAssignmentView] = useState<"domain" | "items">("domain");

  const canAccess = user?.role === "compliance_officer" || user?.role === "tenant_admin";

  const fetchData = useCallback(async () => {
    if (!canAccess || !cycleId) return;
    try {
      // Fetch cycle first; if it fails, show "not found"
      const cycleData = await api.get<AssessmentCycle>(`/assessments/${cycleId}`);
      setCycle(cycleData);

      // Fetch the rest in parallel; if any fail, keep cycle and use empty defaults
      const [usersData, roleData, evidenceData, evAssignData, conflictsData] = await Promise.all([
        api.get<ComplianceUser[]>("/compliance/users"),
        api.get<RoleAssignment[]>(`/assessments/${cycleId}/role-assignments`).catch(() => []),
        api.get<EvidenceItem[]>(`/assessments/${cycleId}/evidence-items`).catch(() => []),
        api.get<EvidenceAssignment[]>(`/assessments/${cycleId}/evidence-assignments`).catch(() => []),
        api.get<{ conflicts: { uid: string; name: string; roles: string[]; msg: string }[] }>(`/assessments/${cycleId}/assignment-conflicts`).catch(() => ({ conflicts: [] })),
      ]);
      setUsers(usersData);
      setRoleAssignments(roleData);
      setEvidenceItems(evidenceData);
      setEvidenceAssignments(evAssignData);
      setConflicts(conflictsData.conflicts || []);
    } catch {
      setCycle(null);
    } finally {
      setLoading(false);
    }
  }, [canAccess, cycleId]);

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
    fetchData();
  }, [user, isPlatformAdmin, canAccess, router, fetchData]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2600);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const groups = useMemo(() => {
    const names = new Set(users.map((u) => u.group_name).filter((g): g is string => !!g));
    return Array.from(names);
  }, [users]);

  const selectableUsers = useMemo(
    () => users.filter((u) => u.id !== user?.id),
    [users, user?.id]
  );
  const l3Users = useMemo(() => selectableUsers.filter((u) => u.is_external), [selectableUsers]);
  const nonL3Users = useMemo(() => selectableUsers.filter((u) => !u.is_external), [selectableUsers]);

  const assignmentsByRole = useMemo(() => {
    const m: Record<string, { groups: string[]; users: string[]; role_start_date: string | null; role_end_date: string | null }> = {};
    for (const r of ROLE_DEFS) {
      m[r.id] = { groups: [], users: [], role_start_date: null, role_end_date: null };
    }
    for (const a of roleAssignments) {
      if (a.assignment_type === "group" && a.group_name) {
        m[a.role]?.groups.push(a.group_name);
      } else if (a.assignment_type === "user" && a.user_id) {
        m[a.role]?.users.push(a.user_id);
      }
      if (m[a.role] && !m[a.role].role_start_date && a.role_start_date) {
        m[a.role].role_start_date = a.role_start_date;
      }
      if (m[a.role] && !m[a.role].role_end_date && a.role_end_date) {
        m[a.role].role_end_date = a.role_end_date;
      }
    }
    return m;
  }, [roleAssignments]);

  useEffect(() => {
    const next: RoleDateRanges = {};
    for (const r of ROLE_DEFS) {
      const roleBucket = assignmentsByRole[r.id] || {
        groups: [],
        users: [],
        role_start_date: null,
        role_end_date: null,
      };
      next[r.id] = {
        role_start_date: roleBucket.role_start_date,
        role_end_date: roleBucket.role_end_date,
      };
    }
    setRoleDateRanges(next);
  }, [assignmentsByRole]);

  useEffect(() => {
    const next: EvidenceDateRanges = {};
    for (const item of evidenceItems) {
      const firstForItem = evidenceAssignments.find((a) => a.evidence_item_id === item.id);
      next[item.id] = {
        evidence_start_date: firstForItem?.evidence_start_date ?? null,
        evidence_end_date: firstForItem?.evidence_end_date ?? null,
      };
    }
    setEvidenceDateRanges(next);
  }, [evidenceAssignments, evidenceItems]);

  /** True when every role (Evidence Collection, L1, L2, Approver) has at least one person or group assigned. */
  const allRolesFilled = useMemo(() => {
    return ROLE_DEFS.every((r) => {
      const a = assignmentsByRole[r.id] || { groups: [], users: [] };
      return a.groups.length > 0 || a.users.length > 0;
    });
  }, [assignmentsByRole]);

  /** Roles that still need at least one assignment. */
  const rolesMissingAssignments = useMemo(() => {
    return ROLE_DEFS.filter((r) => {
      const a = assignmentsByRole[r.id] || { groups: [], users: [] };
      return a.groups.length === 0 && a.users.length === 0;
    });
  }, [assignmentsByRole]);

  /** Resume on the Evidence step if user already completed roles (e.g. logged out and back in). */
  const hasRestoredStep = useRef(false);
  useEffect(() => {
    if (loading || !cycle || hasRestoredStep.current) return;
    if (allRolesFilled && conflicts.length === 0) {
      setStep("evidence");
      hasRestoredStep.current = true;
    }
  }, [loading, cycle, allRolesFilled, conflicts.length]);

  const addRoleAssignment = async (role: string, type: "group" | "user", id: string) => {
    const roleWindow = roleDateRanges[role] || { role_start_date: null, role_end_date: null };
    const current = [...roleAssignments];
    if (type === "group") {
      current.push({
        id: "",
        role,
        assignment_type: "group",
        group_name: id,
        user_id: null,
        role_start_date: roleWindow.role_start_date,
        role_end_date: roleWindow.role_end_date,
      });
    } else {
      current.push({
        id: "",
        role,
        assignment_type: "user",
        group_name: null,
        user_id: id,
        role_start_date: roleWindow.role_start_date,
        role_end_date: roleWindow.role_end_date,
      });
    }
    await saveRoleAssignments(withRoleDates(current));
  };

  const removeRoleAssignment = async (role: string, type: "group" | "user", id: string) => {
    const current = roleAssignments.filter(
      (a) => !(a.role === role && a.assignment_type === type && (type === "group" ? a.group_name === id : a.user_id === id))
    );
    await saveRoleAssignments(withRoleDates(current));
  };

  const updateRoleDateRange = async (role: string, field: "role_start_date" | "role_end_date", value: string) => {
    const normalized = value || null;
    setRoleDateRanges((prev) => {
      const current = prev[role] || { role_start_date: null, role_end_date: null };
      return {
        ...prev,
        [role]: {
          ...current,
          [field]: normalized,
        },
      };
    });
  };

  const withRoleDates = (assignments: RoleAssignment[]) => {
    return assignments.map((a) => {
      const roleWindow = roleDateRanges[a.role] || { role_start_date: null, role_end_date: null };
      return {
        ...a,
        role_start_date: roleWindow.role_start_date,
        role_end_date: roleWindow.role_end_date,
      };
    });
  };

  const saveRoleAssignments = async (
    assignments: RoleAssignment[],
    options?: { applyCycleDatesIfMissing?: boolean }
  ) => {
    setError("");
    setSubmitting(true);
    try {
      const payload = assignments.map((a) => {
        const item: {
          role: string;
          assignment_type: string;
          group_name?: string;
          user_id?: string;
          role_start_date?: string;
          role_end_date?: string;
        } = {
          role: a.role,
          assignment_type: a.assignment_type,
        };
        if (a.assignment_type === "group" && a.group_name) {
          item.group_name = a.group_name;
        } else if (a.assignment_type === "user" && a.user_id) {
          item.user_id = a.user_id;
        }
        if (a.role_start_date) item.role_start_date = a.role_start_date;
        if (a.role_end_date) item.role_end_date = a.role_end_date;
        return item;
      });
      await api.put(`/assessments/${cycleId}/role-assignments`, {
        assignments: payload,
        apply_cycle_dates_if_missing: options?.applyCycleDatesIfMissing ?? false,
      });
      await fetchData();
      setToast("Role assignments saved.");
    } catch (e: unknown) {
      const err = e as Error & { detail?: { conflicts?: { uid: string; name: string; roles: string[]; msg: string }[]; message?: string } };
      let msg = err?.message ?? "Failed to save.";
      const detail = err.detail;
      if (detail && typeof detail === "object" && Array.isArray(detail.conflicts) && detail.conflicts.length > 0) {
        setConflicts(detail.conflicts);
        msg = detail.message ?? msg;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const smeOptions = useMemo(() => {
    const a = assignmentsByRole["it_sme"] || { groups: [], users: [] };
    return { groups: a.groups, users: a.users };
  }, [assignmentsByRole]);

  const domainsWithEvidence = useMemo(
    () => DOMAIN_ORDER.filter((d) => evidenceItems.some((e) => e.domain_id === d)),
    [evidenceItems]
  );

  const getDomainDateRangeForUI = (domainId: string) => {
    const items = evidenceItems.filter((e) => e.domain_id === domainId);
    if (items.length === 0) {
      return { evidence_start_date: null as string | null, evidence_end_date: null as string | null, mixed: false };
    }
    const ranges = items.map((i) => evidenceDateRanges[i.id] || { evidence_start_date: null, evidence_end_date: null });
    const s0 = ranges[0].evidence_start_date;
    const e0 = ranges[0].evidence_end_date;
    const mixed = ranges.some((r) => r.evidence_start_date !== s0 || r.evidence_end_date !== e0);
    return { evidence_start_date: s0, evidence_end_date: e0, mixed };
  };

  const updateEvidenceDateRangeForDomain = (
    domainId: string,
    field: "evidence_start_date" | "evidence_end_date",
    value: string
  ) => {
    const normalized = value || null;
    const ids = evidenceItems.filter((e) => e.domain_id === domainId).map((e) => e.id);
    setEvidenceDateRanges((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        const current = next[id] || { evidence_start_date: null, evidence_end_date: null };
        next[id] = { ...current, [field]: normalized };
      }
      return next;
    });
  };

  const getUniqueEvidenceAssignmentsForDomain = (domainId: string): EvidenceAssignment[] => {
    const itemIds = new Set(evidenceItems.filter((e) => e.domain_id === domainId).map((e) => e.id));
    const seen = new Set<string>();
    const out: EvidenceAssignment[] = [];
    for (const a of evidenceAssignments) {
      if (!itemIds.has(a.evidence_item_id)) continue;
      const key = `${a.assignment_type}:${a.group_name ?? ""}:${a.user_id ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(a);
    }
    return out;
  };

  const removeEvidenceAssignmentFromDomain = (domainId: string, type: "group" | "user", id: string) => {
    const itemIds = new Set(evidenceItems.filter((e) => e.domain_id === domainId).map((e) => e.id));
    setEvidenceAssignments((prev) =>
      prev.filter(
        (e) =>
          !(
            itemIds.has(e.evidence_item_id) &&
            e.assignment_type === type &&
            (type === "group" ? e.group_name === id : e.user_id === id)
          )
      )
    );
  };

  const addEvidenceAssignment = (itemId: string, type: "group" | "user", id: string) => {
    const existing = evidenceAssignments.filter((e) => e.evidence_item_id === itemId && e.assignment_type === type && (type === "group" ? e.group_name === id : e.user_id === id));
    if (existing.length > 0) return;
    const next = [...evidenceAssignments];
    const evidenceWindow = evidenceDateRanges[itemId] || { evidence_start_date: null, evidence_end_date: null };
    next.push({
      id: "",
      evidence_item_id: itemId,
      assignment_type: type,
      group_name: type === "group" ? id : null,
      user_id: type === "user" ? id : null,
      evidence_start_date: evidenceWindow.evidence_start_date,
      evidence_end_date: evidenceWindow.evidence_end_date,
    });
    setEvidenceAssignments(next);
  };

  const removeEvidenceAssignment = (itemId: string, type: "group" | "user", id: string) => {
    setEvidenceAssignments((prev) =>
      prev.filter((e) => !(e.evidence_item_id === itemId && e.assignment_type === type && (type === "group" ? e.group_name === id : e.user_id === id)))
    );
  };

  const updateEvidenceDateRange = (
    itemId: string,
    field: "evidence_start_date" | "evidence_end_date",
    value: string
  ) => {
    const normalized = value || null;
    setEvidenceDateRanges((prev) => {
      const current = prev[itemId] || { evidence_start_date: null, evidence_end_date: null };
      return {
        ...prev,
        [itemId]: {
          ...current,
          [field]: normalized,
        },
      };
    });
  };

  const withEvidenceDates = (assignments: EvidenceAssignment[]) => {
    return assignments.map((a) => {
      const evidenceWindow = evidenceDateRanges[a.evidence_item_id] || {
        evidence_start_date: null,
        evidence_end_date: null,
      };
      return {
        ...a,
        evidence_start_date: evidenceWindow.evidence_start_date,
        evidence_end_date: evidenceWindow.evidence_end_date,
      };
    });
  };

  const handleSaveEvidence = async (options?: { applyItExpertDatesIfMissing?: boolean }): Promise<boolean> => {
    setError("");
    setSubmitting(true);
    try {
      const payload = withEvidenceDates(evidenceAssignments).map((a) => ({
        evidence_item_id: a.evidence_item_id,
        assignment_type: a.assignment_type,
        group_name: a.group_name || undefined,
        user_id: a.user_id || undefined,
        evidence_start_date: a.evidence_start_date || undefined,
        evidence_end_date: a.evidence_end_date || undefined,
      }));
      await api.put(`/assessments/${cycleId}/evidence-assignments`, {
        assignments: payload,
        apply_it_expert_dates_if_missing: options?.applyItExpertDatesIfMissing ?? false,
      });
      await fetchData();
      setToast("Evidence assignments saved.");
      return true;
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Failed to save.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueToArchitecture = async () => {
    const saved = await handleSaveEvidence({ applyItExpertDatesIfMissing: true });
    if (!saved) return;
    router.push(`/select-architecture?cycleId=${cycleId}`);
  };

  const handleBulkAssignByDomain = (domainId: string, type: "group" | "user", id: string) => {
    const itemsInDomain = evidenceItems.filter((e) => e.domain_id === domainId);
    const next = [...evidenceAssignments];
    for (const item of itemsInDomain) {
      const existing = next.some((e) => e.evidence_item_id === item.id && e.assignment_type === type && (type === "group" ? e.group_name === id : e.user_id === id));
      if (!existing) {
        next.push({
          id: "",
          evidence_item_id: item.id,
          assignment_type: type,
          group_name: type === "group" ? id : null,
          user_id: type === "user" ? id : null,
        });
      }
    }
    setEvidenceAssignments(next);
  };

  const handleBulkAssignAllEvidence = (type: "group" | "user", id: string) => {
    const next = [...evidenceAssignments];
    for (const item of evidenceItems) {
      const existing = next.some(
        (e) =>
          e.evidence_item_id === item.id &&
          e.assignment_type === type &&
          (type === "group" ? e.group_name === id : e.user_id === id)
      );
      if (!existing) {
        next.push({
          id: "",
          evidence_item_id: item.id,
          assignment_type: type,
          group_name: type === "group" ? id : null,
          user_id: type === "user" ? id : null,
        });
      }
    }
    setEvidenceAssignments(next);
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-foreground-muted">Loading…</p>
        </main>
      </div>
    );
  }
  if (!cycle) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm text-foreground-muted mb-4">Assessment cycle not found.</p>
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Back to dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col bg-background">
      {toast && (
        <div className="fixed bottom-7 right-7 z-50 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Full-width within AppShell (no max-w-*); shell already applies horizontal padding */}
      <div className="w-full min-w-0 flex-1 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Role & Evidence Assignment</h1>
          <p className="text-sm text-slate-600 mt-1">
            Assign groups and users to roles for this audit cycle. Then assign evidence items to Evidence Collections.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Cycle: <span className="font-semibold text-slate-900">{cycle.label}</span>
            {cycle.display_id && <span className="ml-2 font-mono text-slate-500">{cycle.display_id}</span>}
          </p>
        </div>

        <div className="flex w-full min-w-0 gap-1 mb-6 p-1.5 rounded-xl bg-slate-200">
          <button
            type="button"
            onClick={() => setStep("roles")}
            className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              step === "roles"
                ? "bg-[#1f4e79] text-white shadow-md"
                : "text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            1. Assign Roles
          </button>
          <button
            type="button"
            onClick={() => allRolesFilled && setStep("evidence")}
            disabled={!allRolesFilled}
            className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              step === "evidence"
                ? "bg-[#1f4e79] text-white shadow-md"
                : allRolesFilled
                  ? "text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900"
                  : "text-slate-400 bg-slate-100 cursor-not-allowed"
            }`}
          >
            2. Assign Evidence
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-800 shadow-sm">
            {error}
          </div>
        )}

        {step === "roles" && (
          <>
            {conflicts.length > 0 && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <div className="font-semibold text-red-800 mb-2">
                  Segregation of Duties Violations — {conflicts.length} found
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {conflicts.slice(0, 6).map((c, i) => (
                    <li key={i}>{c.msg}</li>
                  ))}
                  {conflicts.length > 6 && <li>...and {conflicts.length - 6} more</li>}
                </ul>
              </div>
            )}

            {!allRolesFilled && rolesMissingAssignments.length > 0 && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <div className="font-semibold text-amber-900 mb-1">
                  Assign at least one person or group to each role
                </div>
                <p className="text-sm text-amber-800">
                  Missing roles: {rolesMissingAssignments.map((r) => r.label).join(", ")}
                </p>
              </div>
            )}

            <div className="grid w-full min-w-0 gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {ROLE_DEFS.map((r) => {
                const a = assignmentsByRole[r.id] || { groups: [], users: [], role_start_date: null, role_end_date: null };
                const d = roleDateRanges[r.id] || { role_start_date: null, role_end_date: null };
                const isL3 = r.id === "external_assessor";
                const assignedGroupsInOtherRoles = new Set(
                  ROLE_DEFS.filter((def) => def.id !== r.id)
                    .flatMap((def) => assignmentsByRole[def.id]?.groups || [])
                );
                const assignedUsersInOtherRoles = new Set(
                  ROLE_DEFS.filter((def) => def.id !== r.id)
                    .flatMap((def) => assignmentsByRole[def.id]?.users || [])
                );
                // Groups that contain any external user must not be assignable to IT/L1/L2.
                // This keeps external assessors exclusive to Approver (L3) assignments.
                const groupsWithExternalMembers = new Set(
                  selectableUsers
                    .filter((u) => u.is_external && u.group_name)
                    .map((u) => u.group_name as string)
                );
                // If a group is assigned to another role, all users in that group are also blocked
                // from appearing in this role's Individuals tab.
                const usersFromAssignedGroupsInOtherRoles = new Set(
                  selectableUsers
                    .filter((u) => u.group_name && assignedGroupsInOtherRoles.has(u.group_name))
                    .map((u) => u.id)
                );
                const filteredRoleGroups = groups.filter(
                  (g) =>
                    !assignedGroupsInOtherRoles.has(g) &&
                    (r.id === "external_assessor" || !groupsWithExternalMembers.has(g))
                );
                const filteredRoleUsers = (isL3 ? l3Users : nonL3Users).filter(
                  (u) =>
                    !assignedUsersInOtherRoles.has(u.id) &&
                    !usersFromAssignedGroupsInOtherRoles.has(u.id)
                );
                return (
                  <div key={r.id} className={`rounded-xl p-5 shadow-md ${r.cardClass}`}>
                    <div className="mb-3">
                      <div className="text-lg font-bold text-slate-900">{r.label}</div>
                      <div className="text-sm text-slate-600 mt-0.5">{r.desc}</div>
                    </div>
                    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="text-xs text-slate-700">
                        <span className="mb-1 block font-medium">Start date</span>
                        <input
                          type="date"
                          value={d.role_start_date || ""}
                          onChange={(e) => updateRoleDateRange(r.id, "role_start_date", e.target.value)}
                          disabled={submitting}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#1f4e79] focus:outline-none focus:ring-2 focus:ring-[#1f4e79]/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </label>
                      <label className="text-xs text-slate-700">
                        <span className="mb-1 block font-medium">End date</span>
                        <input
                          type="date"
                          value={d.role_end_date || ""}
                          onChange={(e) => updateRoleDateRange(r.id, "role_end_date", e.target.value)}
                          disabled={submitting}
                          min={d.role_start_date || undefined}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#1f4e79] focus:outline-none focus:ring-2 focus:ring-[#1f4e79]/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {a.groups.map((g) => (
                        <span
                          key={g}
                          className="inline-flex items-center gap-1 rounded-full bg-[#1f4e79] px-2.5 py-1 text-xs font-medium text-white"
                        >
                          {g}
                          <button
                            type="button"
                            onClick={() => removeRoleAssignment(r.id, "group", g)}
                            className="hover:opacity-80"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {a.users.map((uid) => {
                        const u = users.find((x) => x.id === uid);
                        return (
                          <span
                            key={uid}
                            className="inline-flex items-center gap-1 rounded-full bg-[#1f4e79] px-2.5 py-1 text-xs font-medium text-white"
                          >
                            {u?.name || u?.email || uid}
                            <button
                              type="button"
                              onClick={() => removeRoleAssignment(r.id, "user", uid)}
                              className="hover:opacity-80"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                    <RolePicker
                      roleId={r.id}
                      isL3={isL3}
                      groups={filteredRoleGroups}
                      users={filteredRoleUsers}
                      assignments={a}
                      onAdd={(type, id) => addRoleAssignment(r.id, type, id)}
                      disabled={submitting}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!allRolesFilled || conflicts.length > 0) return;
                  const toSave = withRoleDates(roleAssignments);
                  await saveRoleAssignments(toSave, { applyCycleDatesIfMissing: true });
                  setStep("evidence");
                }}
                disabled={conflicts.length > 0 || !allRolesFilled}
                title={!allRolesFilled ? "Assign at least one person or group to each role first" : undefined}
                className="rounded-xl bg-[#1f4e79] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#173a5c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Evidence Assignment →
              </button>
              <button
                type="button"
                onClick={() => router.push(`/select-architecture?cycleId=${cycleId}`)}
                className="rounded-xl bg-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-400 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}

        {step === "evidence" && (
          <>
            {smeOptions.groups.length === 0 && smeOptions.users.length === 0 && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                Assign Evidence Collections in Step 1 before assigning evidence items.
              </div>
            )}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {evidenceAssignmentView === "domain" ? "Evidence by domain" : "Evidence item–wise"}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {evidenceAssignmentView === "domain"
                    ? "Set start and end dates per domain (applied to every item in that domain). Use bulk actions or assign experts per domain."
                    : "Adjust dates and Evidence Collections for each evidence code (A1, A2, …)."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceAssignmentView((v) => (v === "domain" ? "items" : "domain"))}
                className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#1f4e79] shadow-sm hover:bg-slate-50 transition-colors"
              >
                {evidenceAssignmentView === "domain" ? "Assign item-wise →" : "← Back to domain view"}
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <BulkAssignAllEvidenceButton
                smeOptions={smeOptions}
                groups={groups}
                users={users}
                onAssign={handleBulkAssignAllEvidence}
                disabled={smeOptions.groups.length === 0 && smeOptions.users.length === 0}
              />
              {Object.entries(DOMAIN_NAMES).map(([domainId, domainName]) => {
                const count = evidenceItems.filter((e) => e.domain_id === domainId).length;
                if (count === 0) return null;
                const domainEaToolbar = getUniqueEvidenceAssignmentsForDomain(domainId);
                const assignedGroupNamesToolbar = domainEaToolbar
                  .filter((a) => a.assignment_type === "group" && a.group_name)
                  .map((a) => a.group_name!);
                const assignedUserIdsToolbar = domainEaToolbar
                  .filter((a) => a.assignment_type === "user" && a.user_id)
                  .map((a) => a.user_id!);
                return (
                  <BulkAssignDomainButton
                    key={domainId}
                    domainId={domainId}
                    domainName={domainName}
                    smeOptions={smeOptions}
                    groups={groups}
                    users={users}
                    onAssign={handleBulkAssignByDomain}
                    disabled={smeOptions.groups.length === 0 && smeOptions.users.length === 0}
                    assignedGroupNames={assignedGroupNamesToolbar}
                    assignedUserIds={assignedUserIdsToolbar}
                  />
                );
              })}
            </div>

            <div className="rounded-xl bg-white shadow-md overflow-visible w-full min-w-0">
              <div className="overflow-x-auto overflow-y-visible w-full min-w-0">
                {evidenceAssignmentView === "domain" ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 w-14">Domain</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 min-w-[200px]">
                          Domain name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Start date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">End date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Evidence Collection assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domainsWithEvidence.map((domainId) => {
                        const domainName = DOMAIN_NAMES[domainId] || domainId;
                        const count = evidenceItems.filter((e) => e.domain_id === domainId).length;
                        const dr = getDomainDateRangeForUI(domainId);
                        const domainEa = getUniqueEvidenceAssignmentsForDomain(domainId);
                        return (
                          <tr key={domainId} className="border-t border-slate-200 align-top">
                            <td className="px-4 py-3 align-middle">
                              <span className="font-mono font-bold text-[#1f4e79]">{domainId}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 leading-snug max-w-xs">
                              {domainName}
                            </td>
                            <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{count}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                {dr.mixed && (
                                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 w-fit">
                                    Mixed dates in items — edit here to align all
                                  </span>
                                )}
                                <input
                                  type="date"
                                  value={dr.evidence_start_date || ""}
                                  onChange={(e) => updateEvidenceDateRangeForDomain(domainId, "evidence_start_date", e.target.value)}
                                  disabled={submitting}
                                  className="w-[150px] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#1f4e79] focus:outline-none focus:ring-2 focus:ring-[#1f4e79]/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={dr.evidence_end_date || ""}
                                onChange={(e) => updateEvidenceDateRangeForDomain(domainId, "evidence_end_date", e.target.value)}
                                disabled={submitting}
                                min={dr.evidence_start_date || undefined}
                                className="w-[150px] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#1f4e79] focus:outline-none focus:ring-2 focus:ring-[#1f4e79]/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                {domainEa.map((e) => (
                                  <span
                                    key={`${domainId}-${e.assignment_type}-${e.group_name || e.user_id}`}
                                    className="inline-flex items-center gap-1 rounded-full bg-[#1f4e79] px-2.5 py-1 text-xs font-medium text-white"
                                  >
                                    {e.group_name || users.find((u) => u.id === e.user_id)?.name || "—"}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeEvidenceAssignmentFromDomain(domainId, e.assignment_type as "group" | "user", (e.group_name || e.user_id)!)
                                      }
                                      className="hover:opacity-80"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                                <BulkAssignDomainButton
                                  domainId={domainId}
                                  domainName={domainName}
                                  smeOptions={smeOptions}
                                  groups={groups}
                                  users={users}
                                  onAssign={handleBulkAssignByDomain}
                                  disabled={smeOptions.groups.length === 0 && smeOptions.users.length === 0}
                                  assignedGroupNames={domainEa
                                    .filter((a) => a.assignment_type === "group" && a.group_name)
                                    .map((a) => a.group_name!)}
                                  assignedUserIds={domainEa
                                    .filter((a) => a.assignment_type === "user" && a.user_id)
                                    .map((a) => a.user_id!)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Evidence Item</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Domain</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Start date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">End date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Evidence Collection assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidenceItems.map((ev) => {
                        const ea = evidenceAssignments.filter((e) => e.evidence_item_id === ev.id);
                        const d = evidenceDateRanges[ev.id] || { evidence_start_date: null, evidence_end_date: null };
                        return (
                          <tr key={ev.id} className="border-t border-slate-200">
                            <td className="px-4 py-3 font-mono font-semibold text-[#1f4e79]">{ev.id}</td>
                            <td className="px-4 py-3 text-slate-900">{ev.name}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {ev.domain_id}: {DOMAIN_NAMES[ev.domain_id] || ev.domain_id}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={d.evidence_start_date || ""}
                                onChange={(e) => updateEvidenceDateRange(ev.id, "evidence_start_date", e.target.value)}
                                disabled={submitting}
                                className="w-[150px] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#1f4e79] focus:outline-none focus:ring-2 focus:ring-[#1f4e79]/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="date"
                                value={d.evidence_end_date || ""}
                                onChange={(e) => updateEvidenceDateRange(ev.id, "evidence_end_date", e.target.value)}
                                disabled={submitting}
                                min={d.evidence_start_date || undefined}
                                className="w-[150px] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#1f4e79] focus:outline-none focus:ring-2 focus:ring-[#1f4e79]/30 disabled:cursor-not-allowed disabled:bg-slate-100"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                {ea.map((e) => (
                                  <span
                                    key={`${e.evidence_item_id}-${e.assignment_type}-${e.group_name || e.user_id}`}
                                    className="inline-flex items-center gap-1 rounded-full bg-[#1f4e79] px-2.5 py-1 text-xs font-medium text-white"
                                  >
                                    {e.group_name || users.find((u) => u.id === e.user_id)?.name || "—"}
                                    <button
                                      type="button"
                                      onClick={() => removeEvidenceAssignment(ev.id, e.assignment_type as "group" | "user", (e.group_name || e.user_id)!)}
                                      className="hover:opacity-80"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                                <EvidencePicker
                                  itemId={ev.id}
                                  smeOptions={smeOptions}
                                  groups={groups}
                                  users={users}
                                  assignments={ea}
                                  onAdd={(type, id) => addEvidenceAssignment(ev.id, type, id)}
                                  disabled={submitting || (smeOptions.groups.length === 0 && smeOptions.users.length === 0)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("roles")}
                className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-300 transition-colors"
              >
                ← Back to Roles
              </button>
              <button
                type="button"
                onClick={handleContinueToArchitecture}
                disabled={submitting}
                className="rounded-xl bg-[#1f4e79] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#173a5c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Saving…" : "Continue to Architecture"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BulkAssignAllEvidenceButton({
  smeOptions,
  groups,
  users,
  onAssign,
  disabled,
}: {
  smeOptions: { groups: string[]; users: string[] };
  groups: string[];
  users: ComplianceUser[];
  onAssign: (type: "group" | "user", id: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"groups" | "users">("groups");
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const recalc = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const popupWidth = 288; // w-72
      const popupHeightEstimate = 320;
      const margin = 8;
      const spaceBelow = window.innerHeight - r.bottom;
      const placeAbove = spaceBelow < popupHeightEstimate && r.top > popupHeightEstimate;

      const top = placeAbove
        ? Math.max(margin, r.top - popupHeightEstimate - 4)
        : Math.min(window.innerHeight - popupHeightEstimate - margin, r.bottom + 4);
      const left = Math.max(margin, Math.min(r.left, window.innerWidth - popupWidth - margin));
      setPopupPos({ top, left });
    };

    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open]);

  const filteredGroups = groups.filter((g) => smeOptions.groups.includes(g) && g.toLowerCase().includes(q.toLowerCase()));
  const smeUserIds = new Set<string>([
    ...smeOptions.users,
    ...users
      .filter((u) => u.group_name && smeOptions.groups.includes(u.group_name))
      .map((u) => u.id),
  ]);
  const filteredUsers = users.filter(
    (u) =>
      smeUserIds.has(u.id) &&
      ((u.name || "").toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="rounded-lg bg-[#1f4e79] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173a5c] disabled:opacity-50 transition-colors shadow"
      >
        Assign one for all evidence
      </button>
      {open && (
        <div
          className="fixed z-120 w-72 rounded-xl bg-white shadow-xl overflow-hidden ring-1 ring-slate-300"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="px-3 py-2 text-xs font-medium text-slate-600 border-b border-slate-200 bg-slate-100">
            Assign one Evidence Collection to all evidence items
          </div>
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => { setView("groups"); setQ(""); }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "groups" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => { setView("users"); setQ(""); }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "users" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              Individuals
            </button>
          </div>
          <div className="p-2 border-b border-slate-200 bg-white">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search..."
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#1f4e79]/40 focus:bg-white border border-slate-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {view === "groups" &&
              (filteredGroups.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">No Evidence Collection groups</p>
              ) : (
                filteredGroups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { onAssign("group", g); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium">{g}</span>
                  </button>
                ))
              ))}
            {view === "users" &&
              (filteredUsers.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">No Evidence Collection users</p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { onAssign("user", u.id); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#1f4e79] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {getInitials(u.name || u.email)}
                    </span>
                    <span className="truncate font-medium text-slate-900">{u.name || u.email}</span>
                  </button>
                ))
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BulkAssignDomainButton({
  domainId,
  domainName,
  smeOptions,
  groups,
  users,
  onAssign,
  disabled,
  assignedGroupNames = [],
  assignedUserIds = [],
}: {
  domainId: string;
  domainName: string;
  smeOptions: { groups: string[]; users: string[] };
  groups: string[];
  users: ComplianceUser[];
  onAssign: (domainId: string, type: "group" | "user", id: string) => void;
  disabled: boolean;
  /** Groups already assigned in this domain — omitted from the picker. */
  assignedGroupNames?: readonly string[];
  /** User IDs already assigned in this domain — omitted from the picker. */
  assignedUserIds?: readonly string[];
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"groups" | "users">("groups");
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const recalc = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const popupWidth = 288; // w-72
      const popupHeightEstimate = 320;
      const margin = 8;
      const spaceBelow = window.innerHeight - r.bottom;
      const placeAbove = spaceBelow < popupHeightEstimate && r.top > popupHeightEstimate;

      const top = placeAbove
        ? Math.max(margin, r.top - popupHeightEstimate - 4)
        : Math.min(window.innerHeight - popupHeightEstimate - margin, r.bottom + 4);
      const left = Math.max(margin, Math.min(r.left, window.innerWidth - popupWidth - margin));
      setPopupPos({ top, left });
    };

    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open]);

  const assignedGroupsSet = useMemo(() => new Set(assignedGroupNames), [assignedGroupNames]);
  const assignedUsersSet = useMemo(() => new Set(assignedUserIds), [assignedUserIds]);
  const userIdsCoveredByAssignedGroups = useMemo(
    () => userIdsBelongingToAssignedGroups(users, assignedGroupsSet),
    [users, assignedGroupsSet]
  );

  const filteredGroups = groups.filter(
    (g) =>
      smeOptions.groups.includes(g) &&
      !assignedGroupsSet.has(g) &&
      g.toLowerCase().includes(q.toLowerCase())
  );
  // Evidence Collection individuals should include:
  // 1) directly assigned Evidence Collection users
  // 2) users that belong to Evidence Collection-assigned groups
  const smeUserIds = new Set<string>([
    ...smeOptions.users,
    ...users
      .filter((u) => u.group_name && smeOptions.groups.includes(u.group_name))
      .map((u) => u.id),
  ]);
  const filteredUsers = users.filter(
    (u) =>
      smeUserIds.has(u.id) &&
      !assignedUsersSet.has(u.id) &&
      !userIdsCoveredByAssignedGroups.has(u.id) &&
      (((u.name || "").toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())))
  );

  const hasUnassignedGroupLeft = smeOptions.groups.some((g) => !assignedGroupsSet.has(g));
  const hasUnassignedUserLeft = [...smeUserIds].some(
    (id) => !assignedUsersSet.has(id) && !userIdsCoveredByAssignedGroups.has(id)
  );

  const groupsEmptyMessage =
    !hasUnassignedGroupLeft && smeOptions.groups.length > 0
      ? "All Evidence Collection groups are already assigned for this domain."
      : "No Evidence Collection groups";
  const usersEmptyMessage =
    !hasUnassignedUserLeft && smeUserIds.size > 0
      ? "All Evidence Collection users are already assigned for this domain."
      : "No Evidence Collection users";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors shadow"
      >
        Assign all in {domainId}
      </button>
      {open && (
        <div
          className="fixed z-120 w-72 max-h-[min(24rem,calc(100vh-1rem))] flex flex-col rounded-xl bg-white shadow-xl overflow-hidden ring-1 ring-slate-300"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="px-3 py-2 text-xs font-medium text-slate-600 border-b border-slate-200 bg-slate-100">
            Assign one Evidence Collection to all items in Domain {domainId}: {domainName}
          </div>
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => { setView("groups"); setQ(""); }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "groups" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => { setView("users"); setQ(""); }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "users" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              Individuals
            </button>
          </div>
          <div className="p-2 border-b border-slate-200 bg-white">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search..."
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#1f4e79]/40 focus:bg-white border border-slate-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {view === "groups" &&
              (filteredGroups.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500 px-2">
                  {hasUnassignedGroupLeft ? "No matches." : groupsEmptyMessage}
                </p>
              ) : (
                filteredGroups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { onAssign(domainId, "group", g); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium">{g}</span>
                  </button>
                ))
              ))}
            {view === "users" &&
              (filteredUsers.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500 px-2">
                  {hasUnassignedUserLeft ? "No matches." : usersEmptyMessage}
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { onAssign(domainId, "user", u.id); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#1f4e79] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {getInitials(u.name || u.email)}
                    </span>
                    <span className="truncate font-medium text-slate-900">{u.name || u.email}</span>
                  </button>
                ))
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EvidencePicker({
  itemId,
  smeOptions,
  groups,
  users,
  assignments,
  onAdd,
  disabled,
}: {
  itemId: string;
  smeOptions: { groups: string[]; users: string[] };
  groups: string[];
  users: ComplianceUser[];
  assignments: EvidenceAssignment[];
  onAdd: (type: "group" | "user", id: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"groups" | "users">("groups");
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const recalc = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const popupWidth = 288; // w-72
      const popupHeightEstimate = 300;
      const margin = 8;
      const spaceBelow = window.innerHeight - r.bottom;
      const placeAbove = spaceBelow < popupHeightEstimate && r.top > popupHeightEstimate;

      const top = placeAbove
        ? Math.max(margin, r.top - popupHeightEstimate - 4)
        : Math.min(window.innerHeight - popupHeightEstimate - margin, r.bottom + 4);
      const left = Math.max(margin, Math.min(r.left, window.innerWidth - popupWidth - margin));
      setPopupPos({ top, left });
    };

    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open]);

  const assignedGroupSet = useMemo(() => {
    const s = new Set<string>();
    for (const a of assignments) {
      if (a.assignment_type === "group" && a.group_name) s.add(a.group_name);
    }
    return s;
  }, [assignments]);
  const assignedUserSet = useMemo(() => {
    const s = new Set<string>();
    for (const a of assignments) {
      if (a.assignment_type === "user" && a.user_id) s.add(a.user_id);
    }
    return s;
  }, [assignments]);
  const userIdsCoveredByAssignedGroups = useMemo(
    () => userIdsBelongingToAssignedGroups(users, assignedGroupSet),
    [users, assignedGroupSet]
  );

  const filteredGroups = groups.filter(
    (g) =>
      smeOptions.groups.includes(g) &&
      !assignedGroupSet.has(g) &&
      g.toLowerCase().includes(q.toLowerCase())
  );
  // Evidence Collection individuals should include:
  // 1) directly assigned Evidence Collection users
  // 2) users that belong to Evidence Collection-assigned groups
  const smeUserIds = new Set<string>([
    ...smeOptions.users,
    ...users
      .filter((u) => u.group_name && smeOptions.groups.includes(u.group_name))
      .map((u) => u.id),
  ]);
  const filteredUsers = users.filter(
    (u) =>
      smeUserIds.has(u.id) &&
      !assignedUserSet.has(u.id) &&
      !userIdsCoveredByAssignedGroups.has(u.id) &&
      (((u.name || "").toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())))
  );

  const hasUnassignedGroupLeft = smeOptions.groups.some((g) => !assignedGroupSet.has(g));
  const hasUnassignedUserLeft = [...smeUserIds].some(
    (id) => !assignedUserSet.has(id) && !userIdsCoveredByAssignedGroups.has(id)
  );
  const groupsEmptyMessage =
    !hasUnassignedGroupLeft && smeOptions.groups.length > 0
      ? "All Evidence Collection groups are already assigned to this item."
      : "No Evidence Collection groups";
  const usersEmptyMessage =
    !hasUnassignedUserLeft && smeUserIds.size > 0
      ? "All Evidence Collection users are already assigned to this item."
      : "No Evidence Collection users";

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="rounded-lg bg-[#1f4e79] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173a5c] disabled:opacity-50 transition-colors shadow"
      >
        + Add
      </button>
      {open && (
        <div
          className="fixed z-120 w-72 rounded-xl bg-white shadow-xl overflow-hidden ring-1 ring-slate-300"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="flex border-b border-slate-200 bg-slate-100">
            <button
              type="button"
              onClick={() => { setView("groups"); setQ(""); }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "groups" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => { setView("users"); setQ(""); }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "users" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              Individuals
            </button>
          </div>
          <div className="p-2 border-b border-slate-200 bg-white">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search..."
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#1f4e79]/40 focus:bg-white border border-slate-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {view === "groups" &&
              (filteredGroups.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500 px-2">
                  {hasUnassignedGroupLeft ? "No matches." : groupsEmptyMessage}
                </p>
              ) : (
                filteredGroups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { onAdd("group", g); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium">{g}</span>
                  </button>
                ))
              ))}
            {view === "users" &&
              (filteredUsers.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500 px-2">
                  {hasUnassignedUserLeft ? "No matches." : usersEmptyMessage}
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { onAdd("user", u.id); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#1f4e79] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {getInitials(u.name || u.email)}
                    </span>
                    <span className="truncate font-medium text-slate-900">{u.name || u.email}</span>
                  </button>
                ))
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RolePicker({
  roleId,
  isL3,
  groups,
  users,
  assignments,
  onAdd,
  disabled,
}: {
  roleId: string;
  isL3: boolean;
  groups: string[];
  users: ComplianceUser[];
  assignments: { groups: string[]; users: string[] };
  onAdd: (type: "group" | "user", id: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"groups" | "users">(isL3 ? "users" : "groups");
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const filteredGroups = groups.filter((g) => g.toLowerCase().includes(q.toLowerCase()));
  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="rounded-lg bg-[#1f4e79] px-3 py-2 text-xs font-semibold text-white hover:bg-[#173a5c] disabled:opacity-50 transition-colors shadow"
      >
        + Add
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-xl bg-white shadow-xl overflow-hidden ring-1 ring-slate-300">
          {isL3 && (
            <div className="px-3 py-2 text-xs font-medium text-amber-900 bg-amber-100 border-b border-amber-300">
              Only external assessors are eligible for L3
            </div>
          )}
          <div className="flex border-b border-slate-200 bg-slate-100">
            {!isL3 && (
              <button
                type="button"
                onClick={() => { setView("groups"); setQ(""); }}
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "groups" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
              >
                Groups
              </button>
            )}
            <button
              type="button"
              onClick={() => { setView("users"); setQ(""); }}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${view === "users" ? "bg-[#1f4e79] text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              Individuals
            </button>
          </div>
          <div className="p-2 border-b border-slate-200 bg-white">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search..."
              className="w-full rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#1f4e79]/40 focus:bg-white border border-slate-300"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {view === "groups" &&
              (filteredGroups.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">No groups found</p>
              ) : (
                filteredGroups.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { onAdd("group", g); setOpen(false); }}
                    disabled={assignments.groups.includes(g)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="font-medium text-slate-900">{g}</span>
                    {assignments.groups.includes(g) && <span className="text-[#1f4e79] font-bold">✓</span>}
                  </button>
                ))
              ))}
            {view === "users" &&
              (filteredUsers.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500">
                  {isL3 ? "No external users. Mark users as external in Users & Groups." : "No users found"}
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { onAdd("user", u.id); setOpen(false); }}
                    disabled={assignments.users.includes(u.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#1f4e79] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {getInitials(u.name || u.email)}
                    </span>
                    <span className="truncate font-medium text-slate-900">{u.name || u.email}</span>
                    {u.is_external && <span className="text-amber-700 text-[10px] font-medium">EXT</span>}
                    {assignments.users.includes(u.id) && <span className="text-[#1f4e79] font-bold shrink-0">✓</span>}
                  </button>
                ))
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
