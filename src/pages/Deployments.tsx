import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { AlertCircle, ExternalLink, Search, Workflow } from 'lucide-react';
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
import { fetchWorkflowLogs, queryKeys } from '@/services/operationsApi';
import type { WorkflowLog } from '@/types/logs';
import { useAgGridTheme, defaultColDef, gridPagination } from '@/lib/agGridTheme';
import {
  durationAxisUnit,
  formatDateTime,
  formatDuration,
  formatDurationCompact,
  formatNumber,
  truncateLabel,
} from '@/lib/format';
import { conclusionPresentation } from '@/lib/status';
import { cn } from '@/lib/utils';

ModuleRegistry.registerModules([AllCommunityModule]);

type WorkflowRow = WorkflowLog & { repository: string };

const ConclusionCell = ({ value }: ICellRendererParams<WorkflowRow>) => {
  const presentation = conclusionPresentation(value);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold',
        presentation.pill,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', presentation.dot)} aria-hidden="true" />
      {presentation.label}
    </span>
  );
};

const RepositoryCell = ({ value }: ICellRendererParams<WorkflowRow>) =>
  value ? <span className="truncate font-medium text-ink">{value}</span> : null;

const WorkflowUrlCell = ({ value }: ICellRendererParams<WorkflowRow>) =>
  value ? (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-action hover:underline"
    >
      View
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  ) : null;

const Deployments = () => {
  const gridTheme = useAgGridTheme();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.workflowLogs,
    queryFn: fetchWorkflowLogs,
    staleTime: 2 * 60_000,
  });

  const repositories = useMemo(() => data?.repositories ?? [], [data]);

  /** Flatten every repository's workflow logs into grid rows. */
  const allLogs = useMemo<WorkflowRow[]>(
    () =>
      repositories.flatMap((repo) =>
        (repo.workflow_logs ?? []).map((log) => ({ ...log, repository: repo.name })),
      ),
    [repositories],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allLogs;
    return allLogs.filter(
      (log) =>
        log.repository.toLowerCase().includes(term) ||
        log.workflow.toLowerCase().includes(term) ||
        (log.branch ?? '').toLowerCase().includes(term) ||
        (log.actor ?? '').toLowerCase().includes(term),
    );
  }, [allLogs, search]);

  const totals = useMemo(
    () =>
      repositories.reduce(
        (acc, repo) => ({
          successful: acc.successful + repo.successful_deployments,
          failed: acc.failed + repo.failed_deployments,
          time: acc.time + repo.total_deployment_time,
        }),
        { successful: 0, failed: 0, time: 0 },
      ),
    [repositories],
  );

  const columnDefs = useMemo<ColDef<WorkflowRow>[]>(
    () => [
      {
        field: 'repository',
        headerName: 'Repository',
        minWidth: 170,
        flex: 1.4,
        cellRenderer: RepositoryCell,
      },
      { field: 'workflow', headerName: 'Workflow', minWidth: 160, flex: 1.3 },
      { field: 'branch', headerName: 'Branch', minWidth: 120 },
      { field: 'conclusion', headerName: 'Conclusion', minWidth: 130, cellRenderer: ConclusionCell },
      {
        field: 'created_at',
        headerName: 'Created',
        minWidth: 165,
        valueFormatter: (params) => formatDateTime(params.value),
      },
      {
        field: 'duration',
        headerName: 'Duration',
        minWidth: 105,
        type: 'numericColumn',
        valueFormatter: (params) => formatDuration(params.value),
      },
      { field: 'actor', headerName: 'Actor', minWidth: 120 },
      {
        field: 'url',
        headerName: 'Run',
        minWidth: 80,
        sortable: false,
        filter: false,
        cellRenderer: WorkflowUrlCell,
      },
    ],
    [],
  );

  const chartData = useMemo(
    () =>
      repositories.map((repo) => ({
        name: truncateLabel(repo.name, 16),
        successful: repo.successful_deployments,
        failed: repo.failed_deployments,
        workflows: repo.total_workflows,
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

  const resolved = totals.successful + totals.failed;
  const successRate = resolved > 0 ? Math.round((totals.successful / resolved) * 100) : null;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operations / deployments"
        title="Deployment activity"
        description="Inspect workflow outcomes, branch context and delivery time without leaving the operational workspace."
        actions={
          <Button variant="outline" onClick={() => void refetch()} disabled={isLoading}>
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
          description="The operations API did not respond. Retry, or check the function logs if this persists."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : allLogs.length === 0 ? (
        <StatePanel
          className="mt-8"
          icon={<Workflow className="h-5 w-5" />}
          title="No workflow runs recorded"
          description="Workflow runs will appear here as soon as a repository publishes a deployment."
        />
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Deployment summary">
            <MetricCard
              label="Workflow runs"
              value={formatNumber(allLogs.length)}
              detail="Runs in this response"
              tone="action"
            />
            <MetricCard
              label="Successful"
              value={formatNumber(totals.successful)}
              detail="Completed deployments"
              tone="success"
            />
            <MetricCard
              label="Failed"
              value={formatNumber(totals.failed)}
              detail={successRate !== null ? `${100 - successRate}% of resolved runs` : 'Runs needing attention'}
              tone="danger"
            />
            <MetricCard
              label="Delivery time"
              value={formatDurationCompact(totals.time)}
              detail="Combined deployment time"
              tone="info"
            />
          </section>

          <DataPanel
            className="mt-6"
            title="Workflow runs"
            description={`${filtered.length} of ${allLogs.length} runs`}
            flush
            toolbar={
              <div className="relative w-full sm:w-72">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
                  aria-hidden="true"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filter by repo, workflow, branch…"
                  aria-label="Filter workflow runs"
                  className="h-9 pl-8 text-sm"
                />
              </div>
            }
          >
            <div style={{ height: 470 }}>
              <AgGridReact<WorkflowRow>
                theme={gridTheme}
                rowData={filtered}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows
                {...gridPagination}
                overlayNoRowsTemplate="<span style='font-size:12px;color:var(--ink-muted)'>No runs match this filter.</span>"
              />
            </div>
          </DataPanel>

          <section className="mt-10" aria-labelledby="deployment-charts-heading">
            <SectionHeading
              index="01 / Analysis"
              id="deployment-charts-heading"
              title="Deployment metrics"
              description="Outcome mix and time spent per repository."
            />
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <DataPanel>
                <ChartFrame
                  title="Deployments by outcome"
                  description="Successful versus failed runs."
                  data={chartData}
                  rotatedLabels
                  yLabel="Count"
                  series={[
                    { key: 'successful', label: 'Successful', color: 'var(--chart-2)' },
                    { key: 'failed', label: 'Failed', color: 'var(--chart-4)' },
                    { key: 'workflows', label: 'Workflows', color: 'var(--chart-5)' },
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

export default Deployments;
