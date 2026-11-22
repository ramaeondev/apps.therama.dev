import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Small uppercase signal label, e.g. "Operations / repositories". */
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Page introduction shared by every route: a signal eyebrow, a fluid display
 * title and a readable description. This is the app's signature treatment —
 * the vertical accent rule plus uppercase signal label.
 */
const PageHeader = ({ eyebrow, title, description, actions, className }: PageHeaderProps) => (
  <div
    className={cn(
      'flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10',
      className,
    )}
  >
    <div className="min-w-0 max-w-3xl">
      <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-action">
        <span className="h-4 w-px bg-action" aria-hidden="true" />
        {eyebrow}
      </p>
      <h1 className="mt-3 text-balance text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-ink-muted">
        {description}
      </p>
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
  </div>
);

export default PageHeader;
