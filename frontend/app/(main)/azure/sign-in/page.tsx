"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2, Cloud, AlertCircle, ArrowLeft } from "lucide-react";
import {
  AwsPageHeader,
  awsButtonSecondaryClass,
  awsButtonPrimaryClass,
} from "@/components/aws/aws-page-header";
import { useAuth } from "@/lib/auth-context";
import { getAzureConfig, startAzureOAuth, type AzureConfigResponse } from "@/lib/azure-api";

function formatUnlocked(c: AzureConfigResponse | null): boolean {
  if (!c) return false;
  return Boolean(typeof c.dashboard_unlocked === "boolean" ? c.dashboard_unlocked : c.configured);
}

function AzureSignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCycleId } = useAuth();
  const [config, setConfig] = useState<AzureConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback((): Promise<void> => {
    if (!activeCycleId) {
      setConfig(null);
      setLoading(false);
      return Promise.resolve();
    }
    setLoading(true);
    return getAzureConfig(activeCycleId)
      .then(setConfig)
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, [activeCycleId]);

  useEffect(() => {
    queueMicrotask(() => load());
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const st = searchParams.get("azure_oauth");
    if (st === "success") {
      setBanner({
        type: "success",
        text: "Microsoft OAuth completed. Opening the dashboard if your connection is verified.",
      });
      void load().then(() => {
        getAzureConfig(activeCycleId).then((c) => {
          if (formatUnlocked(c)) router.replace("/azure/dashboard");
        });
      });
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (st === "error") {
      const msg = searchParams.get("message");
      setBanner({
        type: "error",
        text: msg ? decodeURIComponent(msg.replace(/\+/g, " ")) : "Microsoft sign-in did not complete.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, load, activeCycleId, router]);

  const oauthEnv = Boolean(config?.azure_oauth_env_configured);

  const onStartSignIn = () => {
    if (!activeCycleId) return;
    setBanner(null);
    setStarting(true);
    startAzureOAuth(activeCycleId)
      .then((res) => {
        const url = res.authorization_url;
        if (url && typeof window !== "undefined") window.location.href = url;
      })
      .catch((err: Error & { detail?: unknown }) => {
        const text = typeof err.detail === "string" ? err.detail : err.message || "Could not start Microsoft sign-in.";
        setBanner({ type: "error", text });
      })
      .finally(() => setStarting(false));
  };

  if (!activeCycleId) {
    return (
      <>
        <AwsPageHeader
          title="Microsoft sign-in"
          subtitle="Step 2 of 2 — select an assessment cycle in the app header, then return here."
        />
        <div className="w-full max-w-xl mx-auto mt-8 rounded-lg border px-4 py-3 text-sm" style={{ borderColor: "var(--warning)", background: "var(--warning-bg)", color: "var(--warning)" }}>
          No active cycle selected. Choose a cycle above, then open this page again.
        </div>
      </>
    );
  }

  if (loading && !config) {
    return (
      <>
        <AwsPageHeader title="Microsoft sign-in" subtitle="Preparing…" />
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      </>
    );
  }

  const unlocked = formatUnlocked(config);

  return (
    <>
      <AwsPageHeader
        title="Microsoft sign-in"
        subtitle="Step 2 of 2 — complete OAuth here. After you authorize, Microsoft redirects through the API and you land on the Azure dashboard. Subscription and tenant are detected unless you saved a specific subscription on Connect first."
      />
      <div className="w-full max-w-xl mx-auto space-y-6 mt-6">
        <Link
          href="/azure"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium underline"
          style={{ color: "var(--primary)" }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Azure Connect (step 1)
        </Link>
        {banner && (
          <div
            className="rounded-lg border px-4 py-3 text-sm flex items-start gap-3"
            style={{
              borderColor: banner.type === "success" ? "var(--success)" : "var(--danger)",
              background: banner.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
              color: banner.type === "success" ? "var(--success)" : "var(--danger)",
            }}
          >
            {banner.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            <p>{banner.text}</p>
          </div>
        )}

        {!oauthEnv && (
          <div className="rounded-lg border px-4 py-3 text-sm space-y-2" style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--foreground)" }}>
            <p className="font-medium">Why you are not sent to Microsoft yet</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
              The browser cannot open a valid Microsoft sign-in URL by itself. Your API must build it using an Entra{" "}
              <strong>delegated</strong> app registration (client ID + secret) and a registered redirect URI. That is separate from{" "}
              <code className="font-mono text-[11px]">AZURE_CLIENT_ID</code> / <code className="font-mono text-[11px]">AZURE_CLIENT_SECRET</code>{" "}
              used for service-principal collection.
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
              Add to <code className="font-mono text-[11px]">backend/.env</code> (then restart the API)
            </p>
            <ul className="text-xs list-disc list-inside space-y-1" style={{ color: "var(--foreground-muted)" }}>
              <li>
                <code className="font-mono text-[11px]">AZURE_OAUTH_CLIENT_ID</code> — Entra app (public) client ID for user sign-in
              </li>
              <li>
                <code className="font-mono text-[11px]">AZURE_OAUTH_CLIENT_SECRET</code> — that app’s client secret
              </li>
              <li>
                <code className="font-mono text-[11px]">AZURE_OAUTH_REDIRECT_URI</code> — must match Entra exactly, e.g.{" "}
                <code className="font-mono text-[11px] break-all">http://127.0.0.1:8000/api/v1/cloud/azure/auth/oauth/callback</code>{" "}
                (use your real API host/port)
              </li>
              <li>
                <code className="font-mono text-[11px]">TENANT_AWS_ENCRYPTION_KEY</code> — required to store refresh tokens after sign-in
              </li>
            </ul>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              In Entra ID, add the same redirect URI, enable delegated <strong>Azure Service Management → user_impersonation</strong> and{" "}
              <code className="font-mono text-[11px]">offline_access</code>. Ensure <code className="font-mono text-[11px]">NEXT_PUBLIC_BACKEND_URL</code>{" "}
              in the frontend points at this API so <code className="font-mono text-[11px]">/config</code> sees OAuth as enabled.
            </p>
          </div>
        )}

        {unlocked && config && (
          <div
            className="rounded-lg border p-5 flex flex-col gap-3"
            style={{ borderColor: "var(--success)", background: "var(--success-bg, rgba(34,197,94,0.06))" }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-8 w-8 shrink-0" style={{ color: "var(--success)" }} />
              <div>
                <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Ready to gather evidence
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                  Subscription {config.azure_subscription_id ?? "—"} · Tenant {config.azure_tenant_id ?? "—"}
                </p>
              </div>
            </div>
            <Link href="/azure/dashboard" className={`inline-flex items-center justify-center gap-2 ${awsButtonPrimaryClass}`}>
              Open Azure dashboard
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        )}

        {oauthEnv && !unlocked && (
          <div className="card rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--primary)" }}>
              OAuth
            </p>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5" style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Sign in with Microsoft
              </h2>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: "var(--foreground-muted)" }}>
              This page starts the authorization flow. Your browser will open <strong>login.microsoftonline.com</strong>. After you
              sign in, the API stores tokens securely, picks an enabled subscription (or the one you saved on{" "}
              <Link href="/azure" className="underline font-medium" style={{ color: "var(--primary)" }}>
                Connect
              </Link>
              ), runs a Resource Graph check when possible, then sends you to the <strong>dashboard</strong>.
            </p>
            <button
              type="button"
              disabled={starting}
              onClick={onStartSignIn}
              className={`w-full ${awsButtonPrimaryClass}`}
            >
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {starting ? "Opening Microsoft…" : "Sign in with Microsoft"}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href="/azure" className={awsButtonSecondaryClass}>
            Azure Connect (step 1)
          </Link>
          <Link href="/azure/dashboard" className={awsButtonSecondaryClass}>
            Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

export default function AzureSignInPage() {
  return (
    <Suspense
      fallback={
        <>
          <AwsPageHeader title="Microsoft sign-in" subtitle="Loading…" />
          <div className="w-full max-w-xl mx-auto py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
          </div>
        </>
      }
    >
      <AzureSignInPageContent />
    </Suspense>
  );
}
