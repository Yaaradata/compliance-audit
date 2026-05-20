'use client';

import { useCallback } from 'react';
import {
  INBOX_SORT_TEXT_CONTROL_CLASS,
  inboxSortAriaLabel,
  inboxSortControlLabel,
  toggleInboxSortDirection,
  type RegIntelInboxSortState,
} from './regIntelInboxSort';

export function RegIntelInboxSortControl({
  sort,
  onSortChange,
}: {
  sort: RegIntelInboxSortState;
  onSortChange: (next: RegIntelInboxSortState) => void;
}) {
  const handleActivate = useCallback(() => {
    onSortChange(toggleInboxSortDirection(sort));
  }, [onSortChange, sort]);

  const desc = sort.direction === 'desc';

  return (
    <button
      type="button"
      data-reg-intel-inbox-sort="true"
      aria-pressed={desc}
      aria-label={inboxSortAriaLabel(sort)}
      className={INBOX_SORT_TEXT_CONTROL_CLASS}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleActivate();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <span aria-hidden className="text-sm leading-none text-slate-400">
        {desc ? '⇵' : '⇅'}
      </span>
      <span>{inboxSortControlLabel(sort)}</span>
    </button>
  );
}
