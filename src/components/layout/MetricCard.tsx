import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'action' | 'success' | 'warn' | 'danger' | 'info' | 'neutral';

const toneDot: Record<Tone, string> = {
  action: 'bg-action',
  success: 'bg-success',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-faint',
};

interface MetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  tone?: Tone;
  icon?: ReactNode;
  /** Optional small delta/annotation rendered beside the value. */
  badge?: ReactNode;
}

/**
 * A single KPI. Values use tabular numerals so columns of metrics line up
 * across routes.
 */
const MetricCard = ({ label, value, detail, tone = 'action', icon, badge }: MetricCardProps) => (
  <div className="group relative flex flex-col justify-between gap-3 rounded-xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-line-strong sm:p-5">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      {icon ? (
        <span className="text-ink-faint transition-colors group-hover:text-ink-muted" aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', toneDot[tone])} aria-hidden="true" />
      )}
    </div>
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <p className="tabular text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-ink">
        {value}
      </p>
      {badge}
    </div>
    {detail ? <p className="text-xs leading-5 text-ink-muted">{detail}</p> : null}
  </div>
);

export default MetricCard;
