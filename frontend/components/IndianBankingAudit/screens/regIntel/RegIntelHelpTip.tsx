'use client';

import React from 'react';

export type RegIntelHelpTipAlign = 'center' | 'start' | 'end';

const TIP_WIDTH = 'w-[min(18rem,calc(100vw-2rem))]';

export function RegIntelHelpTip({
  text,
  label = 'Help',
  align = 'center',
}: {
  text: string;
  label?: string;
  /** `end` = anchor to trigger right (tooltip grows left) — avoids clip in `overflow-x-hidden` panes. */
  align?: RegIntelHelpTipAlign;
}) {
  const positionCls =
    align === 'end'
      ? `bottom-[calc(100%+6px)] right-0 left-auto ${TIP_WIDTH}`
      : align === 'start'
        ? `bottom-[calc(100%+6px)] left-0 right-auto ${TIP_WIDTH}`
        : `bottom-[calc(100%+6px)] left-1/2 ${TIP_WIDTH} -translate-x-1/2`;

  const caretCls =
    align === 'end'
      ? 'absolute right-2 top-full border-[6px] border-transparent border-t-slate-900'
      : align === 'start'
        ? 'absolute left-2 top-full border-[6px] border-transparent border-t-slate-900'
        : 'absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-slate-900';

  return (
    <span className="group/regtip relative inline-flex shrink-0 items-center align-middle">
      <span
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold leading-none text-slate-600 hover:border-slate-400 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        tabIndex={0}
        aria-label={label}
      >
        ?
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none invisible absolute z-[100] rounded-md bg-slate-900 px-2.5 py-2 text-left text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity delay-200 duration-200 group-hover/regtip:visible group-hover/regtip:opacity-100 group-focus-within/regtip:visible group-focus-within/regtip:opacity-100 ${positionCls} break-words`}
      >
        {text}
        <span className={caretCls} aria-hidden />
      </span>
    </span>
  );
}
