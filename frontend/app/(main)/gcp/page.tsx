"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2, Trash2, Cloud } from "lucide-react";
import {
  AwsPageHeader,
  awsButtonSecondaryClass,
  awsButtonPrimaryClass,
} from "@/components/aws/aws-page-header";
import { useAuth } from "@/lib/auth-context";
import {
  getGcpConfig,
  deleteAllGcpEvidence,
  saveGcpProjectContext,
  testGcpCredentials,
  startGcpOAuth,
  disconnectGcpOAuth,
} from "@/lib/gcp-api";

export default function GcpConnectPage() {
  const router = useRouter();
  const { activeCycleId } = useAuth();
  /** Project + email + IAM check + test connection (+ OAuth if enabled). Allows dashboard even when strict user:email IAM is not satisfied. */
  const [connectReady, setConnectReady] = useState<boolean | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [projectSaved, setProjectSaved] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [projectInput, setProjectInput] = useState("");
  const [accessEmailInput, setAccessEmailInput] = useState("");
  const [accessVerificationEmail, setAccessVerificationEmail] = useState<string | null>(null);
  const [iamAccessVerified, setIamAccessVerified] = useState<boolean | null>(null);
  const [iamAccessDetail, setIamAccessDetail] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [startingOauth, setStartingOauth] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [retryingVerify, setRetryingVerify] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    return getGcpConfig(activeCycleId)
      .then((c) => {
        setConnectReady(
          typeof c.dashboard_unlocked === "boolean" ? c.dashboard_unlocked : c.configured
        );
        setProjectId(c.project_id);
        setOauthEnabled(Boolean(c.oauth_enabled));
        setProjectSaved(Boolean(c.project_saved));
        setGoogleEmail(c.google_user_email ?? null);
        setAccessVerificationEmail(c.access_verification_email ?? null);
        setIamAccessVerified(typeof c.iam_access_verified === "boolean" ? c.iam_access_verified : null);
        setIamAccessDetail(c.iam_access_detail ?? null);
        setProjectInput(c.project_id ?? "");
        setAccessEmailInput(c.access_verification_email ?? "");
      })
      .catch(() => {
        setConnectReady(false);
        setProjectId(null);
        setOauthEnabled(false);
        setProjectSaved(false);
        setGoogleEmail(null);
        setAccessVerificationEmail(null);
        setIamAccessVerified(null);
        setIamAccessDetail(null);
      });
  }, [activeCycleId]);

  const redirectIfGcpReady = useCallback(
    async (cycleId: string | null | undefined) => {
      const id = (cycleId || "").trim();
      if (!id) return;
      try {
        const c = await getGcpConfig(id);
        const ok = typeof c.dashboard_unlocked === "boolean" ? c.dashboard_unlocked : c.configured;
        if (ok) router.push("/gcp/dashboard");
      } catch {
        /* ignore */
      }
    },
    [router]
  );

  useEffect(() => {
    queueMicrotask(() => {
      load();
    });
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const st = p.get("gcp_oauth");
    if (st === "success") {
      setMessage({ type: "success", text: "Google account connected for this cycle." });
      load().then(() => redirectIfGcpReady(activeCycleId));
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (st === "error") {
      const msg = p.get("message");
      setMessage({
        type: "error",
        text: msg ? decodeURIComponent(msg.replace(/\+/g, " ")) : "Google sign-in did not complete.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [load, redirectIfGcpReady, activeCycleId]);

  const onSaveProject = () => {
    if (!activeCycleId) return;
    setMessage(null);
    setSavingProject(true);
    saveGcpProjectContext(activeCycleId, projectInput.trim(), accessEmailInput.trim())
      .then((res) => {
        setMessage({
          type: "success",
          text: (res.message || "Project and email verified.").trim(),
        });
        return load().then(() => redirectIfGcpReady(activeCycleId));
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Could not save project.";
        setMessage({ type: "error", text });
      })
      .finally(() => setSavingProject(false));
  };

  const onSignInGoogle = () => {
    if (!activeCycleId) return;
    setMessage(null);
    setStartingOauth(true);
    startGcpOAuth(activeCycleId)
      .then((res) => {
        const url = res.authorization_url;
        if (url && typeof window !== "undefined") window.location.href = url;
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Could not start Google sign-in.";
        setMessage({ type: "error", text });
      })
      .finally(() => setStartingOauth(false));
  };

  const onDisconnectGoogle = () => {
    if (!activeCycleId) return;
    if (!confirm("Disconnect Google for this cycle? You will need to sign in again to collect evidence.")) return;
    setMessage(null);
    disconnectGcpOAuth(activeCycleId)
      .then(() => {
        setMessage({ type: "success", text: "Google account disconnected." });
        load();
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Disconnect failed.";
        setMessage({ type: "error", text });
      });
  };

  const onRetryApiVerification = () => {
    if (!activeCycleId) return;
    setMessage(null);
    setRetryingVerify(true);
    testGcpCredentials(activeCycleId)
      .then(() => load().then(() => redirectIfGcpReady(activeCycleId)))
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Verification failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setRetryingVerify(false));
  };

  const onDeleteAll = () => {
    if (!activeCycleId) return;
    if (
      !confirm(
        "Delete all GCP evidence and collector runs for this cycle, and clear Connect settings? You will enter project and email again. This cannot be undone."
      )
    )
      return;
    setMessage(null);
    setDeleting(true);
    deleteAllGcpEvidence(activeCycleId)
      .then((res) => {
        setMessage({
          type: "success",
          text: `Deleted ${res.deleted_evidence} evidence row(s) and ${res.deleted_runs} run(s).${
            res.connect_config_cleared ? " Connect settings were cleared — enter project ID and email again." : ""
          }`,
        });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("gcp-collection-completed"));
        load();
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Delete failed.";
        setMessage({ type: "error", text });
      })
      .finally(() => setDeleting(false));
  };

  if (connectReady === null) {
    return (
      <>
        <AwsPageHeader
          title="Connect"
          subtitle="Enter the GCP project ID and a team member’s email to verify IAM access for this cycle."
        />
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-16">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: "var(--muted)", color: "var(--primary)" }}
          >
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Checking configuration…
          </p>
        </div>
      </>
    );
  }

  if (connectReady) {
    return (
      <>
        <AwsPageHeader
          title="Connect"
          subtitle="Project, team email IAM check, and credentials for this assessment cycle."
        />
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div
            className="card rounded-xl border p-6 flex flex-col gap-5"
            style={{ borderColor: "var(--success)", background: "var(--success-bg, rgba(34,197,94,0.06))" }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-8 w-8 shrink-0" style={{ color: "var(--success)" }} />
                <div>
                  <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                    GCP evidence ready
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Project:{" "}
                    <strong className="font-mono" style={{ color: "var(--foreground)" }}>
                      {projectId}
                    </strong>
                  </p>
                  {accessVerificationEmail ? (
                    <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                      Team email (IAM check):{" "}
                      <strong style={{ color: "var(--foreground)" }}>{accessVerificationEmail}</strong>
                      {typeof iamAccessVerified === "boolean" ? (
                        <span className="ml-2">
                          —{" "}
                          {iamAccessVerified ? (
                            <span style={{ color: "var(--success)" }}>direct project IAM binding found</span>
                          ) : (
                            <span style={{ color: "var(--warning)" }}>no direct user binding (may use a group)</span>
                          )}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                  {iamAccessDetail ? (
                    <p className="text-xs mt-2 leading-snug" style={{ color: "var(--foreground-muted)" }}>
                      {iamAccessDetail}
                    </p>
                  ) : null}
                  {oauthEnabled && googleEmail ? (
                    <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                      Signed-in Google account: <strong style={{ color: "var(--foreground)" }}>{googleEmail}</strong>
                    </p>
                  ) : null}
                  <p className="text-xs mt-2" style={{ color: "var(--foreground-muted)" }}>
                    {oauthEnabled
                      ? "Evidence collection uses the Google account you signed in with (refresh token stored encrypted on the server)."
                      : "The API host must have Application Default Credentials (service account or gcloud) that can access this project."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {oauthEnabled ? (
                  <button
                    type="button"
                    onClick={onDisconnectGoogle}
                    className={awsButtonSecondaryClass}
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                  >
                    Disconnect Google
                  </button>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/gcp/dashboard" className={awsButtonPrimaryClass}>
                Go to Dashboard
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href="/gcp/evidence"
                className={awsButtonSecondaryClass}
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              >
                Evidence
              </Link>
            </div>
          </div>
          {message && (
            <div
              className="rounded-lg border px-4 py-3 text-sm"
              style={{
                borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
                background: message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
                color: message.type === "success" ? "var(--success)" : "var(--danger)",
              }}
            >
              {message.text}
            </div>
          )}
          <section
            className="card rounded-xl border p-5"
            style={{ borderColor: "var(--border)" }}
            aria-label="Danger zone"
          >
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--danger)" }}>
              Reset cycle data
            </h2>
            <p className="text-xs mb-3" style={{ color: "var(--foreground-muted)" }}>
              Removes evidence and collector runs for this cycle and clears this cycle&apos;s GCP connection (project,
              team email, Google sign-in if used). You start the Connect flow from the beginning.
            </p>
            <button
              type="button"
              disabled={deleting || !activeCycleId}
              onClick={onDeleteAll}
              className={awsButtonSecondaryClass}
              style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? "Deleting…" : "Delete all GCP evidence for this cycle"}
            </button>
          </section>
        </div>
      </>
    );
  }

  // After saving project + email, always prompt for Google sign-in regardless of oauthEnabled flag.
  // IAM is checked in the OAuth callback using the signed-in user's credentials — never ADC/SA.
  const needsGoogleOnly = projectSaved && !googleEmail;

  return (
    <>
      <AwsPageHeader
        title="Connect"
        subtitle="Save the GCP project ID and team member email, then sign in with Google. We check IAM using your Google account — you never need to add this app's service account to your project."
      />
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {!activeCycleId && (
          <div
            className="rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}
          >
            Select an assessment cycle first. Evidence is scoped per cycle.
          </div>
        )}

        {message && (
          <div
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
              background: message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
              color: message.type === "success" ? "var(--success)" : "var(--danger)",
            }}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section className="card rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <Cloud className="w-5 h-5" style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {needsGoogleOnly ? "Project saved" : "Google Cloud project"}
              </h2>
            </div>

            {!needsGoogleOnly ? (
              /* Step 1: Enter project ID + team email */
              <>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  Enter the <strong>GCP project ID</strong> and the <strong>team member email</strong>{" "}
                  you want to confirm. After saving, sign in with Google — IAM is checked using your
                  Google account, so no service account needs to be added to the customer project.
                </p>
                <label className="block text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                  GCP project ID
                  <input
                    type="text"
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                    placeholder="e.g. my-audit-project-123"
                    disabled={!activeCycleId || savingProject}
                    className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm font-mono"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      color: "var(--foreground)",
                    }}
                    autoComplete="off"
                  />
                </label>
                <label className="block text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                  Team member email (Google account)
                  <input
                    type="email"
                    value={accessEmailInput}
                    onChange={(e) => setAccessEmailInput(e.target.value)}
                    placeholder="e.g. analyst@yourcompany.com"
                    disabled={!activeCycleId || savingProject}
                    className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      color: "var(--foreground)",
                    }}
                    autoComplete="email"
                  />
                </label>
                <button
                  type="button"
                  disabled={!activeCycleId || savingProject || !projectInput.trim() || !accessEmailInput.trim()}
                  onClick={onSaveProject}
                  className={awsButtonPrimaryClass}
                >
                  {savingProject ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {savingProject ? "Saving…" : "Save and continue"}
                </button>
              </>
            ) : (
              /* Step 2: Sign in with Google to verify IAM */
              <>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  Project <span className="font-mono font-medium">{projectId}</span> saved.{" "}
                  Sign in with a Google account that has access to that project — we read the IAM policy
                  as <strong>you</strong> to confirm <span className="font-mono text-xs">{accessVerificationEmail}</span> has a role.
                </p>
                <button
                  type="button"
                  disabled={!activeCycleId || startingOauth}
                  onClick={onSignInGoogle}
                  className={awsButtonPrimaryClass}
                >
                  {startingOauth ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {startingOauth ? "Redirecting…" : "Sign in with Google"}
                </button>
                <button
                  type="button"
                  onClick={() => { setProjectSaved(false); setGoogleEmail(null); }}
                  className="text-xs underline mt-1"
                  style={{ color: "var(--foreground-muted)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Change project or email
                </button>
              </>
            )}
          </section>

          <section className="card rounded-xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              How it works
            </h2>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
              <li>
                Save the GCP project ID and the team member email (must appear as a direct{" "}
                <code className="text-xs font-mono">user:email</code> on the project IAM policy).
              </li>
              <li>
                Sign in with Google. We read the IAM policy <strong>as you</strong>, confirm the team
                email has a role on the project. No service account from this app needs access to your project.
              </li>
              <li>
                After verification succeeds, open <strong>Dashboard</strong> and run <strong>Fetch GCP evidence</strong> (you may
                be taken there automatically when ready).
              </li>
            </ol>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Deleting all GCP evidence for this cycle clears Connect settings; you will enter project and email again.
            </p>
            {projectSaved && activeCycleId ? (
              <p className="text-xs pt-2 border-t" style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}>
                If setup does not finish after Google sign-in, click{" "}
                <button
                  type="button"
                  className="underline font-medium"
                  style={{ color: "var(--primary)" }}
                  disabled={retryingVerify}
                  onClick={onRetryApiVerification}
                >
                  {retryingVerify ? "Verifying…" : "Retry API verification"}
                </button>
                .
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
