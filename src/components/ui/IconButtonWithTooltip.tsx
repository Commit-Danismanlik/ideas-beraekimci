import type { ReactNode } from 'react';

const tooltipClasses =
  'absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-slate-800/95 text-indigo-100 border border-indigo-500/30 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 -translate-y-1 transition-all duration-200 delay-75 z-[60]';

export interface IconButtonWithTooltipProps {
  onClick: () => void;
  tooltip: string;
  children: ReactNode;
  className: string;
  ariaLabel: string;
  ariaExpanded?: boolean;
}

export const IconButtonWithTooltip = ({
  onClick,
  tooltip,
  children,
  className,
  ariaLabel,
  ariaExpanded,
}: IconButtonWithTooltipProps): JSX.Element => {
  return (
    <div className="group relative">
      <span className={tooltipClasses} role="tooltip">
        {tooltip}
      </span>
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
      >
        {children}
      </button>
    </div>
  );
};
