/** Provenance legend — exact wording from the reference JSX footer. */
export function KeystoneFooter() {
  return (
    <footer className="px-5 pb-8 pt-4 sm:px-8">
      <p className="text-[10.5px] leading-relaxed" style={{ color: "var(--ks-faint)" }}>
        Illustrative figures pending Lion validation.{" "}
        <span style={{ color: "var(--ks-green)" }}>●</span> Sourced &nbsp;
        <span style={{ color: "var(--ks-amber)" }}>●</span> Illustrative &nbsp;
        <span style={{ color: "var(--ks-faint)" }}>●</span> Assumption / validate &nbsp;
        <span style={{ color: "#6b7280" }}>●</span> Open range
      </p>
    </footer>
  );
}
