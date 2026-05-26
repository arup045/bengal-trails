import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Primary call-to-action — either an href link or an onClick button. */
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  /** Optional secondary, lower-emphasis action. */
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondary?: () => void;
  children?: ReactNode;
  className?: string;
}

// A single, consistent friendly empty state used across the app:
// a soft illustrated icon, a warm headline, one clear primary action,
// and an optional secondary link. Keeps "nothing here yet" moments on-brand
// and always gives the user an obvious next step.
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondary,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-14 ${className}`}>
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-orange-200/40 blur-2xl rounded-full" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-orange-50 border border-purple-100 flex items-center justify-center">
          <Icon className="w-9 h-9 text-purple-500" strokeWidth={1.75} />
        </div>
      </div>

      <h3 className="font-poppins text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="font-poppins text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">{description}</p>
      )}

      {(actionLabel || secondaryLabel || children) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {actionLabel && actionHref && (
            <a href={actionHref}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition shadow-sm">
              {actionLabel}
            </a>
          )}
          {actionLabel && !actionHref && onAction && (
            <button onClick={onAction}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-poppins text-sm font-medium hover:bg-purple-700 transition shadow-sm">
              {actionLabel}
            </button>
          )}
          {secondaryLabel && secondaryHref && (
            <a href={secondaryHref}
              className="px-5 py-2.5 text-purple-600 rounded-full font-poppins text-sm font-medium hover:bg-purple-50 transition">
              {secondaryLabel}
            </a>
          )}
          {secondaryLabel && !secondaryHref && onSecondary && (
            <button onClick={onSecondary}
              className="px-5 py-2.5 text-purple-600 rounded-full font-poppins text-sm font-medium hover:bg-purple-50 transition">
              {secondaryLabel}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
