import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy `/UK_Process_Audit/v3` — enforcement intelligence removed; redirect to latest (v2). */
export default async function UKProcessAuditV3RedirectPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  redirect(`/UK_Process_Audit/v2${query ? `?${query}` : ""}`);
}
