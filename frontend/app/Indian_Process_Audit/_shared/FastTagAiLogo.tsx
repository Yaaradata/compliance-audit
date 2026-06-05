/** Standard ✨ mark for AI surfaces in Fast-Tag — use instead of other AI icons. */
export function FastTagAiLogo({ className = 'text-sm' }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      ✨
    </span>
  );
}
