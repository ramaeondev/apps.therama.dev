import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Boxes, ExternalLink, Search } from 'lucide-react';
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
  fetchVercelProjects,
  queryKeys,
  type VercelProject,
} from '@/services/operationsApi';
import {
  formatDateTime,
  formatNumber,
  formatRate,
  formatRelative,
  truncateLabel,
} from '@/lib/format';

const ProjectCell = ({ project }: { project: VercelProject }) => {
  const label = project.static_project_title ?? project.vercel_project_name;
  return (
    <span className="flex min-w-0 flex-col">
      <span className="max-w-[240px] truncate font-medium text-ink" title={label}>
        {label}
      </span>
      <span
        className="max-w-[240px] truncate text-[0.68rem] text-ink-faint"
        title={project.vercel_project_name}
      >
        {project.vercel_project_name}
      </span>
    </span>
  );
};

const DomainCell = ({ project }: { project: VercelProject }) => {
  if (!project.production_domain) return <span className="text-ink-faint">—</span>;
  return (
    <a
      href={`https://${project.production_domain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-w-0 items-center gap-1 font-medium text-action hover:underline"
    >
      <span className="max-w-[220px] truncate">{project.production_domain}</span>
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
};

const MappingCell = ({ project }: { project: VercelProject }) =>
  project.is_mapped ? (
    <span className="inline-flex items-center rounded-md bg-success-soft px-2 py-0.5 text-[0.68rem] font-semibold text-success-soft-ink">
      Mapped
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-[0.68rem] font-medium text-ink-muted">
      Unmapped
    </span>
  );

const Repositories = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.vercelProjects,
    queryFn: fetchVercelProjects,
    staleTime: 5 * 60_000,
  });

  const projects = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (project) =>
        project.vercel_project_name.toLowerCase().includes(term) ||
        (project.static_project_title ?? '').toLowerCase().includes(term) ||
        (project.production_domain ?? '').toLowerCase().includes(term) ||
        (project.framework ?? '').toLowerCase().includes(term),
    );
  }, [projects, search]);

  const totals = useMemo(
    () =>
      projects.reduce(
        (acc, project) => ({
          deployments: acc.deployments + project.total_deployments,
          mapped: acc.mapped + (project.is_mapped ? 1 : 0),
        }),
        { deployments: 0, mapped: 0 },
      ),
    [projects],
  );

  const columns = useMemo<DataTableColumn<VercelProject>[]>(
    () => [
      {
        id: 'project',
        header: 'Project',
        className: 'min-w-[230px]',
        cell: (project) => <ProjectCell project={project} />,
        sortValue: (project) => project.static_project_title ?? project.vercel_project_name,
      },
      {
        id: 'domain',
        header: 'Domain',
        className: 'min-w-[200px] max-w-[260px]',
        cell: (project) => <DomainCell project={project} />,
        sortValue: (project) => project.production_domain,
      },
      {
        id: 'framework',
        header: 'Framework',
        className: 'min-w-[120px]',
        cell: (project) => (
          <span className="block truncate text-ink-muted">{project.framework || '—'}</span>
        ),
        sortValue: (project) => project.framework,
      },
      {
        id: 'portfolio',
        header: 'Portfolio',
        className: 'min-w-[115px]',
        cell: (project) => <MappingCell project={project} />,
        sortValue: (project) => (project.is_mapped ? 1 : 0),
      },
      {
        id: 'deployments',
        header: 'Deployments',
        align: 'right',
        className: 'min-w-[130px]',
        cell: (project) => (
          <span className="tabular">{formatNumber(project.total_deployments)}</span>
        ),
        sortValue: (project) => project.total_deployments,
      },
      {
        id: 'last_deployed_at',
        header: 'Last deployed',
        className: 'min-w-[150px]',
        cell: (project) => (
          <span className="whitespace-nowrap text-ink-muted">
            {formatRelative(project.last_deployed_at)}
          </span>
        ),
        sortValue: (project) => project.last_deployed_at,
      },
      {
        id: 'last_production_success_at',
        header: 'Last production',
        className: 'min-w-[165px]',
        cell: (project) => (
          <span className="whitespace-nowrap text-ink-muted">
            {formatDateTime(project.last_production_success_at)}
          </span>
        ),
        sortValue: (project) => project.last_production_success_at,
      },
    ],
    [],
  );

  const chartData = useMemo(
    () =>
      projects
        .filter((project) => project.total_deployments > 0)
        .map((project) => ({
          name: truncateLabel(project.static_project_title ?? project.vercel_project_name, 16),
          deployments: project.total_deployments,
        })),
    [projects],
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Operations / projects"
        title="Project registry"
        description="Every Vercel project behind the portfolio, with its mapping to a portfolio entry."
        actions={
          <Button variant="outline" onClick={() => void refetch()} disabled={isLoading}>
            Refresh data
          </Button>
        }
      />

      {isLoading ? (
        <div className="mt-8 space-y-6" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading project registry…</span>
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
          title="Project registry unavailable"
          description="The deployments service did not respond. Retry, or check the Vercel sync service if this persists."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : projects.length === 0 ? (
        <StatePanel
          className="mt-8"
          icon={<Boxes className="h-5 w-5" />}
          title="No projects tracked"
          description="Vercel projects appear here once the sync service has seen them."
        />
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Project summary">
            <MetricCard label="Projects" value={projects.length} detail="Synced from Vercel" tone="action" />
            <MetricCard
              label="Mapped"
              value={formatNumber(totals.mapped)}
              detail={`${formatRate(totals.mapped, projects.length)} linked to the portfolio`}
              tone="success"
            />
            <MetricCard
              label="Unmapped"
              value={formatNumber(projects.length - totals.mapped)}
              detail="Not yet linked to a portfolio entry"
              tone="neutral"
            />
            <MetricCard
              label="Deployments"
              value={formatNumber(totals.deployments)}
              detail="Across all projects"
              tone="info"
            />
          </section>

          <DataPanel
            className="mt-6"
            title="Project registry"
            description={`${filtered.length} of ${projects.length} projects`}
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
                  placeholder="Filter projects…"
                  aria-label="Filter projects"
                  className="h-9 pl-8 text-sm"
                />
              </div>
            }
          >
            <DataTable
              rows={filtered}
              columns={columns}
              getRowId={(project) => project.vercel_project_id}
              caption="Vercel projects and their portfolio mappings"
              emptyMessage="No projects match this filter."
              maxHeightClassName="max-h-[420px]"
              minWidthClassName="min-w-[1120px]"
            />
          </DataPanel>

          <section className="mt-10" aria-labelledby="repo-charts-heading">
            <SectionHeading
              index="01 / Analysis"
              id="repo-charts-heading"
              title="Deployment volume"
              description="Total deployments per project, from the Vercel sync."
            />
            <div className="mt-6">
              <DataPanel>
                <ChartFrame
                  title="Deployments by project"
                  description="Total deployments recorded for each Vercel project."
                  data={chartData}
                  rotatedLabels
                  yLabel="Count"
                  series={[{ key: 'deployments', label: 'Deployments', color: 'var(--chart-1)' }]}
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
