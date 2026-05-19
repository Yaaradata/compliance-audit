/** Display label for supervisory lens rows — drops trailing "Readiness". */
export function formatSupervisoryLensLabel(label: string): string {
  return label.replace(/\s+readiness\s*$/i, '').trim();
}
