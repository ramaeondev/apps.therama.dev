import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataPanelProps {
  title?: string;
  description?: string;
  /** Toolbar content (filters, counts) rendered beside the title. */
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Removes inner padding — used for full-bleed grids. */
  flush?: boolean;
  id?: string;
  labelledBy?: string;
}

/**
 * The surface used for tables and charts. Keeps border, radius and header
 * rhythm identical between the repositories and deployments workspaces.
 */
const DataPanel = ({
  title,
  description,
  toolbar,
  children,
  className,
  flush = false,
  id,
  labelledBy,
}: DataPanelProps) => (
  <section
    id={id}
    aria-labelledby={labelledBy}
    className={cn(
      'overflow-hidden rounded-xl border border-line bg-surface shadow-[0_1px_2px_0_rgb(0_0_0/0.03)]',
      className,
    )}
  >
    {title || toolbar ? (
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          {title ? (
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          ) : null}
          {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
        </div>
        {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
      </div>
    ) : null}
    <div className={flush ? '' : 'p-4 sm:p-5'}>{children}</div>
  </section>
);

export default DataPanel;
