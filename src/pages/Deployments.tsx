import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ExternalLink, Rocket, Search } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/layout/MetricCard';
import DataPanel from '@/components/layout/DataPanel';
import SectionHeading from '@/components/layout/SectionHeading';
import StatePanel from '@/components/layout/StatePanel';
import ChartFrame from '@/components/charts/ChartFrame';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchDeploymentHistory,
  fetchProjectDeploymentSummaries,
  queryKeys,
  type Deployment,
  type ProjectDeploymentSummary,
} from '@/services/operationsApi';
import {
  durationAxisUnit,
  formatDateTime,
  formatDurationCompact,
  formatNumber,
  formatRate,
  formatRelative,
  truncateLabel,
} from '@/lib/format';
import { deploymentStatePresentation } from '@/lib/status';
import { cn } from '@/lib/utils';

const StateCell = ({ deployment }: { deployment: Deployment }) => {
  const presentation = deploymentStatePresentation(deployment.state);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.68rem] font-semibold',
        presentation.pill,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', presentation.dot)} aria-hidden="true" />
      {presentation.label}
    </span>
  );
};

const EnvironmentCell = ({ deployment }: { deployment: Deployment }) =>
  deployment.is_production ? (
    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-action-soft px-2 py-0.5 text-[0.68rem] font-semibold text-action-soft-ink">
      Production
    </span>
  ) : (
    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-surface-2 px-2 py-0.5 text-[0.68rem] font-medium text-ink-muted">
      Preview
    </span>
  );

const CommitCell = ({ deployment }: { deployment: Deployment }) => {
  const message = (deployment.commit_message ?? '').split('\n')[0];
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="tabular shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-[0.68rem] text-ink-muted">
        {deployment.github_sha ? deployment.github_sha.slice(0, 7) : '—'}
      </span>
      <span className="max-w-[360px] truncate text-ink" title={deployment.commit_message}>
        {message || '—'}
      </span>
    </span>
  );
};

const DeploymentLinkCell = ({ deployment }: { deployment: Deployment }) => {
  const href = deployment.deployment_url || deployment.inspector_url;
  if (!href) return <span className="text-ink-faint">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-action hover:underline"
    >
      {deployment.deployment_url ? 'Visit' : 'Logs'}
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
};

/** Vercel build duration, falling back to the total deployment duration. */
const buildSeconds = (deployment: Deployment): number | null => {
  const seconds = deployment.build_duration_seconds ?? deployment.duration_in_seconds;
  return typeof seconds === 'number' ? seconds : null;
};

type EnvironmentFilter = 'all' | 'production' | 'preview';

const Deployments = () => {
  const [search, setSearch] = useState('');
  const [environment, setEnvironment] = useState<EnvironmentFilter>('all');

  const deploymentsQuery = useQuery({
    queryKey: queryKeys.deployments,
    queryFn: () => fetchDeploymentHistory(),
    staleTime: 2 * 60_000,
  });

  const summariesQuery = useQuery({
    queryKey: queryKeys.deploymentSummaries,
    queryFn: fetchProjectDeploymentSummaries,
    staleTime: 5 * 60_000,
  });

  const deployments = useMemo(() => deploymentsQuery.data ?? [], [deploymentsQuery.data]);
  const summaries = useMemo(() => summariesQuery.data ?? [], [summariesQuery.data]);

  const isLoading = deploymentsQuery.isLoading || summariesQuery.isLoading;
  const isError = deploymentsQuery.isError || summariesQuery.isError;
  const refetch = () => {
    void deploymentsQuery.refetch();
    void summariesQuery.refetch();
  };

  /** Only projects that have actually deployed are interesting here. */
  const activeProjects = useMemo(
    () => summaries.filter((project) => project.total_deployments > 0),
    [summaries],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return deployments.filter((deployment) => {
      if (environment === 'production' && !deployment.is_production) return false;
      if (environment === 'preview' && deployment.is_production) return false;
      if (!term) return true;
      return (
        (deployment.project_name ?? '').toLowerCase().includes(term) ||
        (deployment.github_repo ?? '').toLowerCase().includes(term) ||
        (deployment.github_ref ?? '').toLowerCase().includes(term) ||
        (deployment.actor ?? '').toLowerCase().includes(term) ||
        (deployment.commit_message ?? '').toLowerCase().includes(term) ||
        (deployment.state ?? '').toLowerCase().includes(term)
      );
    });
  }, [deployments, environment, search]);

  const totals = useMemo(() => {
    const ready = deployments.filter((d) => (d.state ?? '').toUpperCase() === 'READY').length;
    const failed = deployments.filter((d) => (d.state ?? '').toUpperCase() === 'ERROR').length;
    const production = deployments.filter((d) => d.is_production).length;
    const durations = deployments
      .map((d) => buildSeconds(d))
      .filter((value): value is number => value !== null);
    const average = durations.length
      ? durations.reduce((sum, value) => sum + value, 0) / durations.length
      : null;
    return { ready, failed, production, average };
  }, [deployments]);

  const columns = useMemo<DataTableColumn<Deployment>[]>(
    () => [
      {
        id: 'project_name',
        header: 'Project',
        className: 'min-w-[170px]',
        cell: (deployment) => (
          <span
            className="block max-w-[220px] truncate font-medium text-ink"
            title={deployment.project_name}
          >
            {deployment.project_name || '—'}
          </span>
        ),
        sortValue: (deployment) => deployment.project_name,
      },
      {
        id: 'is_production',
        header: 'Environment',
        className: 'min-w-[130px]',
        cell: (deployment) => <EnvironmentCell deployment={deployment} />,
        sortValue: (deployment) => (deployment.is_production ? 1 : 0),
      },
      {
        id: 'state',
        header: 'State',
        className: 'min-w-[115px]',
        cell: (deployment) => <StateCell deployment={deployment} />,
        sortValue: (deployment) => deployment.state,
      },
      {
        id: 'commit_message',
        header: 'Commit',
        className: 'min-w-[300px] max-w-[420px]',
        cell: (deployment) => <CommitCell deployment={deployment} />,
        sortValue: (deployment) => deployment.commit_message,
      },
      {
        id: 'github_ref',
        header: 'Branch',
        className: 'min-w-[120px]',
        cell: (deployment) => (
          <span className="block max-w-[140px] truncate text-ink-muted">
            {deployment.github_ref || '—'}
          </span>
        ),
        sortValue: (deployment) => deployment.github_ref,
      },
      {
        id: 'actor',
        header: 'Author',
        className: 'min-w-[120px]',
        cell: (deployment) => (
          <span className="block max-w-[130px] truncate text-ink-muted">
            {deployment.actor || '—'}
          </span>
        ),
        sortValue: (deployment) => deployment.actor,
      },
      {
        id: 'deployment_time',
        header: 'Deployed',
        className: 'min-w-[165px]',
        cell: (deployment) => (
          <span className="whitespace-nowrap text-ink-muted">
            {formatDateTime(deployment.deployment_time)}
          </span>
        ),
        sortValue: (deployment) => deployment.deployment_time,
      },
      {
        id: 'build_duration_seconds',
        header: 'Build',
        align: 'right',
        className: 'min-w-[100px]',
        cell: (deployment) => {
          const seconds = buildSeconds(deployment);
          return (
            <span className="tabular text-ink">
              {seconds !== null ? formatDurationCompact(seconds * 1000) : '—'}
            </span>
          );
        },
        sortValue: (deployment) => buildSeconds(deployment),
      },
      {
        id: 'deployment_url',
        header: 'Link',
        className: 'min-w-[95px]',
        cell: (deployment) => <DeploymentLinkCell deployment={deployment} />,
      },
    ],
    [],
  );

  const volumeData = useMemo(
    () =>
      activeProjects.map((project: ProjectDeploymentSummary) => ({
        name: truncateLabel(project.project_name, 16),
        deployments: project.total_deployments,
        production: project.production_deployments,
      })),
    [activeProjects],
  );

  const outcomeData = useMemo(
    () =>
      activeProjects.map((project) => ({
        name: truncateLabel(project.project_name, 16),
        successful: project.successful_deployments,
        failed: project.failed_deployments,
      })),
    [activeProjects],
  );

  const durationData = useMemo(() => {
    const longest = activeProjects.reduce(
      (max, project) => Math.max(max, project.avg_duration_in_seconds ?? 0),
      0,
    );
    const { divisor, unit } = durationAxisUnit(longest * 1000);
    return {
      unit,
      rows: activeProjects.map((project) => ({
        name: truncateLabel(project.project_name, 16),
        duration: Math.round((((project.avg_duration_in_seconds ?? 0) * 1000) / divisor) * 10) / 10,
      })),
    };
  }, [activeProjects]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operations / deployments"
        title="Deployment activity"
        description="Every production and preview deployment across the portfolio, synced from Vercel."
        actions={
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            Refresh data
          </Button>
        }
      />

      {isLoading ? (
        <div className="mt-8 space-y-6" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading deployment activity…</span>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[470px] rounded-xl" />
        </div>
      ) : isError ? (
        <StatePanel
          className="mt-8"
          tone="danger"
          icon={<AlertCircle className="h-5 w-5" />}
          title="Deployment activity unavailable"
          description="The deployments service did not respond. Retry, or check the Vercel sync service if this persists."
          action={
            <Button variant="outline" onClick={refetch}>
              Try again
            </Button>
          }
        />
      ) : deployments.length === 0 ? (
        <StatePanel
          className="mt-8"
          icon={<Rocket className="h-5 w-5" />}
          title="No deployments recorded"
          description="Deployments appear here as soon as Vercel reports one for a mapped project."
        />
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Deployment summary">
            <MetricCard
              label="Deployments"
              value={formatNumber(deployments.length)}
              detail={`Across ${activeProjects.length} projects`}
              tone="action"
            />
            <MetricCard
              label="Production"
              value={formatNumber(totals.production)}
              detail={`${formatRate(totals.production, deployments.length)} of all deployments`}
              tone="info"
            />
            <MetricCard
              label="Ready"
              value={formatNumber(totals.ready)}
              detail={totals.failed > 0 ? `${formatNumber(totals.failed)} failed` : 'No failed deployments'}
              tone="success"
            />
            <MetricCard
              label="Average build"
              value={totals.average !== null ? formatDurationCompact(totals.average * 1000) : '—'}
              detail="Mean build duration"
              tone="warn"
            />
          </section>

          <DataPanel
            className="mt-6"
            title="Deployments"
            description={`${filtered.length} of ${deployments.length} deployments`}
            flush
            toolbar={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div
                  className="flex items-center gap-0.5 rounded-lg bg-surface-2 p-0.5"
                  role="group"
                  aria-label="Filter by environment"
                >
                  {(['all', 'production', 'preview'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEnvironment(value)}
                      aria-pressed={environment === value}
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors duration-200',
                        environment === value
                          ? 'bg-surface text-ink shadow-sm'
                          : 'text-ink-muted hover:text-ink',
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
                    aria-hidden="true"
                  />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filter by project, branch, commit…"
                    aria-label="Filter deployments"
                    className="h-9 pl-8 text-sm"
                  />
                </div>
              </div>
            }
          >
            <DataTable
              rows={filtered}
              columns={columns}
              getRowId={(deployment) => deployment.id}
              caption="Deployment history across all projects"
              emptyMessage="No deployments match this filter."
              maxHeightClassName="max-h-[460px]"
              minWidthClassName="min-w-[1240px]"
            />
          </DataPanel>

          <section className="mt-10" aria-labelledby="deployment-charts-heading">
            <SectionHeading
              index="01 / Analysis"
              id="deployment-charts-heading"
              title="Deployment metrics"
              description="Volume, outcome mix and build time per project."
            />
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <DataPanel>
                <ChartFrame
                  title="Deployments by project"
                  description="Total deployments, with the production share highlighted."
                  data={volumeData}
                  rotatedLabels
                  yLabel="Count"
                  series={[
                    { key: 'deployments', label: 'All', color: 'var(--chart-5)' },
                    { key: 'production', label: 'Production', color: 'var(--chart-1)' },
                  ]}
                />
              </DataPanel>
              <DataPanel>
                <ChartFrame
                  title="Deployments by outcome"
                  description="Successful versus failed deployments."
                  data={outcomeData}
                  rotatedLabels
                  yLabel="Count"
                  series={[
                    { key: 'successful', label: 'Successful', color: 'var(--chart-2)' },
                    { key: 'failed', label: 'Failed', color: 'var(--chart-4)' },
                  ]}
                />
              </DataPanel>
              <DataPanel className="lg:col-span-2">
                <ChartFrame
                  title="Average build time"
                  description={`Mean build duration per project, in ${durationData.unit}.`}
                  data={durationData.rows}
                  rotatedLabels
                  yLabel={durationData.unit}
                  series={[{ key: 'duration', label: 'Average build', color: 'var(--chart-3)' }]}
                />
              </DataPanel>
            </div>
          </section>

          <section className="mt-10" aria-labelledby="project-summary-heading">
            <SectionHeading
              index="02 / Projects"
              id="project-summary-heading"
              title="Per-project activity"
              description="Deployment totals and the most recent release for each project."
              aside={
                <span className="tabular rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
                  {activeProjects.length} active
                </span>
              }
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {activeProjects.map((project) => (
                <li
                  key={project.project_id}
                  className="rounded-xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-line-strong"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-ink" title={project.project_name}>
                      {project.project_name}
                    </p>
                    <span className="tabular shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-[0.68rem] font-medium text-ink-muted">
                      {formatNumber(project.total_deployments)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div className="flex gap-1.5">
                      <dt className="text-ink-faint">Production</dt>
                      <dd className="tabular text-ink">{formatNumber(project.production_deployments)}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-ink-faint">Failed</dt>
                      <dd
                        className={cn(
                          'tabular',
                          project.failed_deployments > 0 ? 'text-danger-soft-ink' : 'text-ink',
                        )}
                      >
                        {formatNumber(project.failed_deployments)}
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-ink-faint">Avg</dt>
                      <dd className="tabular text-ink">
                        {project.avg_duration_in_seconds !== null
                          ? formatDurationCompact(project.avg_duration_in_seconds * 1000)
                          : '—'}
                      </dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="text-ink-faint">Last</dt>
                      <dd className="truncate text-ink">{formatRelative(project.last_deployed_at)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </AppShell>
  );
};

export default Deployments;
