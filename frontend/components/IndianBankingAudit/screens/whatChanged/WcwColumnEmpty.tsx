/** Pass 6 — single-line column empty state (no clipboard icon). */
export function WcwColumnEmpty({ message }: { message: string }) {
  return <p className="py-4 text-[13px] leading-snug text-[#6B7280]">{message}</p>;
}
