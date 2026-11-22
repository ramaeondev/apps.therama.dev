import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { AlertCircle, GitBranch, Search } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import MetricCard from '@/components/layout/MetricCard';
import DataPanel from '@/components/layout/DataPanel';
import SectionHeading from '@/components/layout/SectionHeading';
import StatePanel from '@/components/layout/StatePanel';
import ChartFrame from '@/components/charts/ChartFrame';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchRepositoryMetrics,
  queryKeys,
  type RepositoryStats,
} from '@/services/operationsApi';
import { useAgGridTheme, defaultColDef, gridPagination } from '@/lib/agGridTheme';
import {
  durationAxisUnit,
  formatDate,
  formatDuration,
  formatDurationCompact,
  formatNumber,
  truncateLabel,
} from '@/lib/format';

ModuleRegistry.registerModules([AllCommunityModule]);

const RepositoryLinkCell = ({ value, data }: ICellRendererParams<RepositoryStats>) => {
  if (!value) return null;
  return (
    <a
      href={data?.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-medium text-action hover:underline"
    >
      <GitBranch className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{value}</span>
    </a>
  );
};

const NumericCell = ({ value }: ICellRendererParams<RepositoryStats>) => (
  <span className="tabular">{formatNumber(value)}</span>
);

const SuccessCell = ({ value }: ICellRendererParams<RepositoryStats>) => (
  <span className="tabular font-medium text-success-soft-ink">{formatNumber(value)}</span>
);

const FailureCell = ({ value }: ICellRendererParams<RepositoryStats>) => (
  <span className="tabular font-medium text-danger-soft-ink">{formatNumber(value)}</span>
);

const Repositories = () => {
  const gridTheme = useAgGridTheme();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.repositories,
    queryFn: fetchRepositoryMetrics,
    staleTime: 2 * 60_000,
  });

  const repositories = useMemo(() => data?.repositories ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return repositories;
    return repositories.filter((repo) => repo.name.toLowerCase().includes(term));
  }, [repositories, search]);

  const totals = useMemo(
    () =>
      repositories.reduce(
        (acc, repo) => ({
          workflows: acc.workflows + repo.total_workflows,
          successful: acc.successful + repo.successful_deployments,
          failed: acc.failed + repo.failed_deployments,
          time: acc.time + repo.total_deployment_time,
        }),
        { workflows: 0, successful: 0, failed: 0, time: 0 },
      ),
    [repositories],
  );

  const columnDefs = useMemo<ColDef<RepositoryStats>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Repository',
        minWidth: 220,
        flex: 2,
        cellRenderer: RepositoryLinkCell,
      },
      {
        field: 'created_at',
        headerName: 'Created',
        minWidth: 130,
        valueFormatter: (params) => formatDate(params.value),
      },
      {
        field: 'total_workflows',
        headerName: 'Workflows',
        minWidth: 110,
        type: 'numericColumn',
        cellRenderer: NumericCell,
      },
      {
        field: 'successful_deployments',
        headerName: 'Successful',
        minWidth: 115,
        type: 'numericColumn',
        cellRenderer: SuccessCell,
      },
      {
        field: 'failed_deployments',
        headerName: 'Failed',
        minWidth: 100,
        type: 'numericColumn',
        cellRenderer: FailureCell,
      },
      {
        field: 'total_deployment_time',
        headerName: 'Total time',
        minWidth: 125,
        type: 'numericColumn',
        valueFormatter: (params) => formatDuration(params.value),
      },
    ],
    [],
  );

  const chartData = useMemo(
    () =>
      repositories.map((repo) => ({
        name: truncateLabel(repo.name, 16),
        workflows: repo.total_workflows,
        successful: repo.successful_deployments,
        failed: repo.failed_deployments,
      })),
    [repositories],
  );

  const timeData = useMemo(() => {
    const longest = repositories.reduce((max, repo) => Math.max(max, repo.total_deployment_time), 0);
    const { divisor, unit } = durationAxisUnit(longest);
    return {
      unit,
      rows: repositories.map((repo) => ({
        name: truncateLabel(repo.name, 16),
        duration: Math.round((repo.total_deployment_time / divisor) * 10) / 10,
      })),
    };
  }, [repositories]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operations / repositories"
        title="Repository pulse"
        description="Workflow throughput and delivery performance for every repository behind the portfolio."
        actions={
          <Button variant="outline" onClick={() => void refetch()} disabled={isLoading}>
            Refresh data
          </Button>
        }
      />

      {isLoading ? (
        <div className="mt-8 space-y-6" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading repository metrics…</span>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[420px] rounded-xl" />
        </div>
      ) : isError ? (
        <StatePanel
          className="mt-8"
          tone="danger"
          icon={<AlertCircle className="h-5 w-5" />}
          title="Repository metrics unavailable"
          description="The operations API did not respond. Retry, or check the function logs if this persists."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : repositories.length === 0 ? (
        <StatePanel
          className="mt-8"
          icon={<GitBranch className="h-5 w-5" />}
          title="No repositories tracked"
          description="Once a repository has workflow activity it will appear here."
        />
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Repository summary">
            <MetricCard label="Repositories" value={repositories.length} detail="Tracked in this workspace" tone="action" />
            <MetricCard label="Workflow runs" value={formatNumber(totals.workflows)} detail="Across all repositories" tone="info" />
            <MetricCard label="Successful" value={formatNumber(totals.successful)} detail="Completed deployments" tone="success" />
            <MetricCard
              label="Failed"
              value={formatNumber(totals.failed)}
              detail={totals.workflows > 0 ? `${Math.round((totals.failed / totals.workflows) * 100)}% of all runs` : 'Runs needing attention'}
              tone="danger"
            />
          </section>

          <DataPanel
            className="mt-6"
            title="Repository statistics"
            description={`${filtered.length} of ${repositories.length} repositories`}
            flush
            toolbar={
              <div className="relative w-full sm:w-64">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
                  aria-hidden="true"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filter repositories…"
                  aria-label="Filter repositories by name"
                  className="h-9 pl-8 text-sm"
                />
              </div>
            }
          >
            <div style={{ height: 440 }}>
              <AgGridReact<RepositoryStats>
                theme={gridTheme}
                rowData={filtered}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows
                {...gridPagination}
                overlayNoRowsTemplate="<span style='font-size:12px;color:var(--ink-muted)'>No repositories match this filter.</span>"
              />
            </div>
          </DataPanel>

          <section className="mt-10" aria-labelledby="repo-charts-heading">
            <SectionHeading
              index="01 / Analysis"
              id="repo-charts-heading"
              title="Delivery breakdown"
              description="Workflow volume and time spent per repository."
              aside={
                <span className="tabular rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
                  Total {formatDurationCompact(totals.time)}
                </span>
              }
            />
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <DataPanel>
                <ChartFrame
                  title="Workflows and deployments"
                  description="Run volume split by outcome."
                  data={chartData}
                  rotatedLabels
                  yLabel="Count"
                  series={[
                    { key: 'workflows', label: 'Workflows', color: 'var(--chart-5)' },
                    { key: 'successful', label: 'Successful', color: 'var(--chart-2)' },
                    { key: 'failed', label: 'Failed', color: 'var(--chart-4)' },
                  ]}
                />
              </DataPanel>
              <DataPanel>
                <ChartFrame
                  title="Total deployment time"
                  description={`Combined time spent delivering each repository, in ${timeData.unit}.`}
                  data={timeData.rows}
                  rotatedLabels
                  yLabel={timeData.unit}
                  series={[{ key: 'duration', label: 'Deployment time', color: 'var(--chart-3)' }]}
                />
              </DataPanel>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
};

export default Repositories;

