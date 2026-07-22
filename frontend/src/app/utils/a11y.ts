import type { KeyboardEvent } from 'react';

// Makes a non-semantic clickable element (a <div> acting as a button/link)
// keyboard- and screen-reader-accessible: spread onto the element to add
// role="button", tabIndex, the click handler, and Enter/Space activation.
//
//   <div {...clickable(() => open(x))} className="...">…</div>
//
// Prefer a real <button>/<a> when practical; use this for existing card divs
// where converting the element would disturb layout/styling.
export function clickable(onClick: () => void, label?: string) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': label,
    onClick,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
  };
}
