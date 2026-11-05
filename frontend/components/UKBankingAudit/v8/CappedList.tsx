"use client";

import { Children, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  limit?: number;
  /** Goes to the full tab. Without it, "Show all" expands the list in place. */
  onShowAll?: () => void;
  showAllLabel?: string;
  /** Set inside a ul or ol, so the button sits in a list item. */
  inList?: boolean;
};

/** Board View lists show the 5 most material items, with a route to the rest. */
export function CappedList({ children, limit = 5, onShowAll, showAllLabel = "Show all", inList = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const hidden = items.length - limit;
  const visible = expanded ? items : items.slice(0, limit);

  const toggle =
    hidden > 0 ? (
      <button
        type="button"
        onClick={() => (onShowAll ? onShowAll() : setExpanded((open) => !open))}
        className="self-start text-[11.5px] font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
      >
        {expanded ? "Show fewer" : `${showAllLabel} (${items.length})`}
      </button>
    ) : null;

  return (
    <>
      {visible}
      {toggle && inList ? <li>{toggle}</li> : toggle}
    </>
  );
}
