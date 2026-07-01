import { redirect } from "next/navigation";
import { LATEST_UKPA_VERSION, UKPA_BASE_PATHS } from "@/components/UK_Process_Audit/ukpa/ukpaVersion";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UKProcessAuditIndexPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  redirect(`${UKPA_BASE_PATHS[LATEST_UKPA_VERSION]}${query ? `?${query}` : ""}`);
}
