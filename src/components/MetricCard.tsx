interface MetricCardProps {
  label: string;
  value: string | number;
  detail: string;
  tone?: 'violet' | 'emerald' | 'amber' | 'rose';
}

const toneClasses = {
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200',
};

const MetricCard = ({ label, value, detail, tone = 'violet' }: MetricCardProps) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
      <span className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone]}`} aria-hidden="true" />
    </div>
    <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
  </div>
);

export default MetricCard;
