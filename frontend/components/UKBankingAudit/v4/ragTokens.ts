export type RagBand = "red" | "amber" | "green";

export const RAG_STYLES: Record<
  RagBand,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    badgeText: string;
    dot: string;
    rail: string;
  }
> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-600",
    badge: "bg-red-600",
    badgeText: "text-white",
    dot: "bg-red-500",
    rail: "border-l-red-500",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    badge: "bg-amber-500",
    badgeText: "text-white",
    dot: "bg-amber-500",
    rail: "border-l-amber-500",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-600",
    badge: "bg-emerald-600",
    badgeText: "text-white",
    dot: "bg-emerald-500",
    rail: "border-l-emerald-500",
  },
};

export function toRagBand(band: string | undefined): RagBand {
  if (band === "red") return "red";
  if (band === "amber") return "amber";
  return "green";
}
