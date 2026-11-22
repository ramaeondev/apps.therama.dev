import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatePanelProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'danger';
  className?: string;
}

/** Shared empty / error surface so states look identical on every route. */
const StatePanel = ({ icon, title, description, action, tone = 'neutral', className }: StatePanelProps) => (
  <div
    role={tone === 'danger' ? 'alert' : 'status'}
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-12 text-center',
      tone === 'danger'
        ? 'border-danger/30 bg-danger-soft'
        : 'border-line bg-surface',
      className,
    )}
  >
    {icon ? (
      <span
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          tone === 'danger' ? 'bg-danger/10 text-danger' : 'bg-surface-2 text-ink-muted',
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
    ) : null}
    <div className="max-w-md">
      <p className={cn('text-sm font-semibold', tone === 'danger' ? 'text-danger-soft-ink' : 'text-ink')}>
        {title}
      </p>
      {description ? (
        <p className={cn('mt-1.5 text-sm leading-6', tone === 'danger' ? 'text-danger-soft-ink/80' : 'text-ink-muted')}>
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="mt-1">{action}</div> : null}
  </div>
);

export default StatePanel;
