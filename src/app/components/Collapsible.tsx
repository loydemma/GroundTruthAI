import type { ReactNode } from "react";

// Native <details> disclosure — accessible, no client JS needed.
export function Collapsible({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <summary className="flex cursor-pointer select-none list-none items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--color-fg-muted)]">
        <span className="text-[var(--color-fg-faint)] transition-transform group-open:rotate-90">
          ▸
        </span>
        {summary}
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
