# Microsoft Azure — Setup and Operations Guide

This document describes **how Azure is wired into the compliance-audit platform** from an administrator and user perspective: what to configure, where credentials live, and how the Connect → Test → Collect flow works. It is **not** a code walkthrough; for implementation details see `backend/app/azure_evidence/`, `backend/app/routers/azure.py`, and `backend/app/config.py`.

---

## 1) What Azure is used for

- **Per assessment cycle**, a user connects **one Azure subscription** (and its **Microsoft Entra directory tenant**) to the product.
- The API uses that connection to run **Azure Resource Graph** (and related) queries and stores results as **Azure** evidence rows in the same evidence store used for other clouds, scoped by tenant, cycle, and user.
- Evidence aligns with the SWIFT workbook mapping in `ref-docs/azure/Azure_Evidence_Collection_SWIFT_v2026.xlsx` (evidence items, resource types, and automation intent).

---

## 2) Prerequisites

| Requirement | Notes |
|-------------|--------|
| **PostgreSQL** | Cycle-scoped Azure settings and encrypted secrets/tokens are stored in the core database. |
| **Encryption key** | OAuth refresh tokens (and optional per-cycle service principal secrets) are encrypted at rest. The platform uses **`TENANT_AWS_ENCRYPTION_KEY`** (KMS-backed material in production; see existing platform docs for key management). |
| **Backend reachable from browser** | OAuth redirect returns to the API first, then the user is sent to the frontend. Redirect URI must match what is registered in Entra. |
| **Frontend `NEXT_PUBLIC_BACKEND_URL`** | Must point at the API that serves `/api/v1/cloud/azure/...` so the UI can call Connect, collect, and evidence endpoints. |

---

## 3) Credential modes (how the API authenticates to Azure)

The API picks credentials in this **order** for a given cycle and user:

1. **Microsoft sign-in (delegated OAuth)**  
   If the user has completed **Sign in with Microsoft** for that cycle and a refresh token is stored, the API uses **MSAL** with that token to obtain access tokens for **Azure Resource Manager** (ARM), including Resource Graph.

2. **Per-cycle service principal**  
   If the user saved an **application (client) ID** and **client secret** on Azure Connect for that cycle (encrypted in DB), the API uses **client credentials** against the **directory tenant ID** saved for that cycle.

3. **Server environment service principal**  
   If **`AZURE_CLIENT_ID`** and **`AZURE_CLIENT_SECRET`** are set in `backend/.env`, the API uses them. **`AZURE_TENANT_ID`** is optional if it matches the tenant ID the user entered on Connect; otherwise set it explicitly for token requests.

4. **Managed identity / DefaultAzureCredential (Azure-hosted API only)**  
   If the API runs on Azure (App Service, Container Apps, etc.) and detects a managed identity environment, it may fall back to **DefaultAzureCredential**.  
   For **local** development without the above, you can set **`AZURE_FORCE_DEFAULT_CREDENTIAL=true`** and use **`az login`** in the same environment as the API process (not recommended for production).

**Important UX rule:** Saving **subscription and tenant** again on Connect **clears** stored Microsoft sign-in tokens for that cycle. Users must **Sign in with Microsoft again** after each manual scope save if they rely on OAuth.

---

## 4) Microsoft Entra app registration (OAuth path)

When using **Sign in with Microsoft**, register a **confidential client** web app in Entra ID.

| Setting | Guidance |
|---------|----------|
| **Redirect URI** | Must exactly match **`AZURE_OAUTH_REDIRECT_URI`** on the API (e.g. `https://your-api.example.com/api/v1/cloud/azure/auth/oauth/callback`). |
| **Client secret** | Create a secret; store it only in server env as **`AZURE_OAUTH_CLIENT_SECRET`**. |
| **Supported account types** | Typically **multitenant + personal** is *not* required for corporate SWIFT use; **single tenant** or **accounts in any org directory** (`organizations`) depends on your Entra configuration. The implementation can use `organizations` when no login tenant GUID is forced. |
| **API permissions (delegated)** | **Azure Service Management** — **`user_impersonation`** (so the signed-in user can act on subscriptions they are allowed to access). Admin consent may be required. |
| **Refresh tokens** | Ensure **`offline_access`** is allowed and consent covers refresh tokens, or users will see errors about missing refresh tokens. |

Optional server settings:

- **`AZURE_OAUTH_LOGIN_TENANT`** — Home-tenant GUID of the **platform’s** app registration when it is single-tenant; leave empty for typical multitenant `organizations` sign-in.
- **`AZURE_OAUTH_FRONTEND_REDIRECT_URL`** — Where to send the browser after OAuth completes (defaults use CORS origin + `/azure/dashboard` or sign-in error route).

---

## 5) Backend environment variables (summary)

Set in **`backend/.env`** (see `Settings` in `backend/app/config.py`):

**OAuth (Sign in with Microsoft)**

| Variable | Purpose |
|----------|---------|
| `AZURE_OAUTH_CLIENT_ID` | Entra application (client) ID |
| `AZURE_OAUTH_CLIENT_SECRET` | Client secret |
| `AZURE_OAUTH_REDIRECT_URI` | OAuth callback URL on the API |
| `AZURE_OAUTH_LOGIN_TENANT` | Optional; single-tenant app home tenant GUID |
| `AZURE_OAUTH_FRONTEND_REDIRECT_URL` | Optional; post-login browser landing URL |

**Server-wide service principal (alternative to per-user OAuth)**

| Variable | Purpose |
|----------|---------|
| `AZURE_CLIENT_ID` | Application ID |
| `AZURE_CLIENT_SECRET` | Secret |
| `AZURE_TENANT_ID` | Optional if same as Connect tenant |

**Other**

| Variable | Purpose |
|----------|---------|
| `TENANT_AWS_ENCRYPTION_KEY` | Required to **store** OAuth refresh tokens and encrypted SP secrets |
| `AZURE_FORCE_DEFAULT_CREDENTIAL` | `true` for local dev with `az login` + same shell as uvicorn |
| `CORS_ORIGINS` | Must include the frontend origin used by the browser |

---

## 6) User flow: Azure Connect

1. User selects an **assessment cycle** (Azure is scoped per cycle).
2. On **Azure → Connect**, user either:
   - Enters **Subscription ID** and **Directory (tenant) ID**, optionally **application ID + secret** for a dedicated SP, and saves; then runs **Test connection**, **or**
   - Clicks **Sign in with Microsoft** (when OAuth env vars are set); subscription and tenant are **discovered** from ARM after successful sign-in when possible.
3. **Test connection** runs a small **Resource Graph** query to confirm read access. On success, Connect marks the cycle as ready and the **Azure dashboard** unlocks.
4. On **Azure dashboard**, **Fetch Azure evidence** starts a collector run; results appear in evidence tables and run history.

---

## 7) Azure RBAC and access expectations

- The identity used (user via OAuth, or service principal) needs sufficient **read** access to the target subscription for Resource Graph, typically **Reader** at subscription scope (or equivalent via management group inheritance).
- If **Test connection** passes but specific collectors return **no rows**, the subscription may have **no matching resources**, or certain resource types are in other subscriptions — not necessarily an API failure.
- **Defender / security**-oriented tables may return empty results if Defender for Cloud is not enabled or assessments are not present.

---

## 8) Operational notes

- **Secrets and tokens** in the database are encrypted; rotation is done by updating Entra secrets and re-saving or re-signing-in as appropriate.
- **Multiple cycles** can use different subscriptions or the same subscription with different stored credentials per user/cycle row.
- **Deleting Azure evidence** from the product may also clear cycle Connect configuration depending on the API behavior you expose — confirm with your deployment’s delete endpoint semantics.

---

## 9) Troubleshooting (quick reference)

| Symptom | Things to check |
|---------|------------------|
| Connect says OAuth not configured | `AZURE_OAUTH_*` trio set on API; API restarted |
| No refresh token / consent errors | App allows `offline_access`; user completes consent; redirect URI exact match |
| Test connection / collect 403 | Reader (or higher read) on subscription; correct subscription ID; tenant matches subscription’s directory |
| Dashboard locked | Test connection not passed; or subscription/tenant missing |
| Collect works but empty resources | Empty subscription for those resource types; verify in Azure Portal or Resource Graph Explorer with same identity |
| Local dev “no credentials” | OAuth sign-in, or `AZURE_CLIENT_ID` + `AZURE_CLIENT_SECRET`, or `AZURE_FORCE_DEFAULT_CREDENTIAL` + `az login` |

---

## 10) Related documentation

| Document | Topic |
|----------|--------|
| `ref-docs/azure/Azure_Evidence_Collection_SWIFT_v2026.xlsx` | Evidence items ↔ Azure resources / APIs (source of truth for scope) |
| `docs/gcp-evidence-collection-guide.md` | Parallel pattern for GCP connect and collection |
| `docs/aws-connect-flow.md` | AWS connect pattern (conceptually similar gating) |

---

*Last updated to reflect the Azure Connect, OAuth, service principal, Resource Graph precheck, and per-cycle storage model described above.*
