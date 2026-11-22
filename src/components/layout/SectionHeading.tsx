import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  /** Numbered signal, e.g. "01 / Selected work". */
  index?: string;
  title: string;
  description?: string;
  /** Right-aligned meta text or control. */
  aside?: ReactNode;
  id?: string;
  className?: string;
}

const SectionHeading = ({ index, title, description, aside, id, className }: SectionHeadingProps) => (
  <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="min-w-0">
      {index ? (
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-action">{index}</p>
      ) : null}
      <h2
        id={id}
        className="mt-1.5 text-balance text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-[1.75rem]"
      >
        {title}
      </h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p> : null}
    </div>
    {aside ? <div className="shrink-0 text-sm text-ink-muted">{aside}</div> : null}
  </div>
);

export default SectionHeading;
