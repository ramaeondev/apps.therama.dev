import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { presentStatus } from '@/lib/status';
import { cn } from '@/lib/utils';
import type { Deployment, EdgeProjectStatus } from '@/services/operationsApi';

interface DeploymentRowProps {
  deployment: Deployment;
  statusLookup: (name: string) => EdgeProjectStatus | undefined;
}

const DeploymentRow = ({ deployment, statusLookup }: DeploymentRowProps) => {
  const projectStatus = statusLookup(deployment.status);
  const status = presentStatus(projectStatus?.name ?? deployment.status, projectStatus?.description);

  return (
    <li
      className={cn(
        'rounded-lg border bg-surface p-4',
        deployment.is_success ? 'border-success/30' : 'border-danger/30',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular text-sm font-semibold text-ink">v{deployment.version}</span>
          {status ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold',
                status.pill,
              )}
              title={status.description}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden="true" />
              {status.label}
            </span>
          ) : null}
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold',
              deployment.is_success
                ? 'bg-success-soft text-success-soft-ink'
                : 'bg-danger-soft text-danger-soft-ink',
            )}
          >
            {deployment.is_success ? (
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            ) : (
              <XCircle className="h-3 w-3" aria-hidden="true" />
            )}
            {deployment.is_success ? 'Success' : 'Failed'}
          </span>
        </div>
        <time className="text-xs text-ink-muted" dateTime={deployment.deployment_time}>
          {formatDateTime(deployment.deployment_time)}
        </time>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-ink-faint">Actor</dt>
          <dd className="truncate text-ink">{deployment.actor || '—'}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-ink-faint">Source</dt>
          <dd className="truncate text-ink">{deployment.source || '—'}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-ink-faint">Git ref</dt>
          <dd className="truncate text-ink">{deployment.github_ref || '—'}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-ink-faint">Duration</dt>
          <dd className="tabular text-ink">{deployment.duration_in_seconds}s</dd>
        </div>
        <div className="flex gap-1.5 sm:col-span-2">
          <dt className="shrink-0 text-ink-faint">Commit</dt>
          <dd className="min-w-0 text-ink">
            <span className="tabular text-ink-muted">{deployment.github_sha?.slice(0, 7)}</span>{' '}
            {deployment.commit_message}
          </dd>
        </div>
      </dl>

      {deployment.deployment_url ? (
        <a
          href={deployment.deployment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-action hover:underline"
        >
          Open deployment
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      ) : null}
    </li>
  );
};

export default DeploymentRow;
