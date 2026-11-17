import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 dark:border-slate-800/80 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-3xl">
      <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
        <span className="h-px w-8 bg-violet-500" aria-hidden="true" />
        {eyebrow}
      </div>
      <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
    {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
  </div>
);

export default PageHeader;
