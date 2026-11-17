import React, { useMemo } from 'react';
import Header from '@/components/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from 'recharts';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ColDef, ValueFormatterParams, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import '../styles/globals.css';
import { LogsResponse, WorkflowLog, Repository } from '@/types/logs';
import { useTheme } from '@/hooks/use-theme';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';

ModuleRegistry.registerModules([AllCommunityModule]);

const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const DeploymentsAgGrid: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const { data, isLoading, error } = useQuery<LogsResponse>({
    queryKey: ['workflow-logs'],
    queryFn: async () => {
      const response = await fetch('https://api.therama.dev/functions/v1/github-get-all-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_logs_required: true,
          group_by_repository: true
        })
      });
      return response.json();
    },
  });

  // Flatten all workflow logs for grid
  const allLogs: (WorkflowLog & { repository: string })[] = useMemo(() => {
    if (!data?.repositories) return [];
    return data.repositories.flatMap(repo =>
      (repo.workflow_logs || []).map(log => ({ ...log, repository: repo.name }))
    );
  }, [data]);

  const columnDefs: ColDef[] = [
    {
      field: 'repository',
      headerName: 'Repository',
      sortable: true,
      filter: true,
    },
    {
      field: 'workflow',
      headerName: 'Workflow',
      sortable: true,
      filter: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
    },
    {
      field: 'conclusion',
      headerName: 'Conclusion',
      sortable: true,
      filter: true,
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      sortable: true,
      filter: true,
      valueFormatter: (params: ValueFormatterParams) => {
        return new Date(params.value).toLocaleString();
      }
    },
    {
      field: 'duration',
      headerName: 'Duration',
      sortable: true,
      filter: true,
      valueFormatter: (params: ValueFormatterParams) => formatTime(params.value),
    },
    {
      field: 'actor',
      headerName: 'Actor',
      sortable: true,
      filter: true,
    },
    {
      field: 'branch',
      headerName: 'Branch',
      sortable: true,
      filter: true,
    },
    {
      field: 'commit.message',
      headerName: 'Commit Message',
      sortable: true,
      filter: true,
      valueGetter: (params: ValueGetterParams<WorkflowLog>) => params.data.commit?.message || '',
    },
    {
      field: 'url',
      headerName: 'Workflow URL',
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
          >
            View
          </a>
        );
      },
    },
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 120,
  };

  const repositories = data?.repositories ?? [];
  const allSuccessful = repositories.reduce((sum, repository) => sum + repository.successful_deployments, 0);
  const allFailed = repositories.reduce((sum, repository) => sum + repository.failed_deployments, 0);
  const totalDeploymentTime = repositories.reduce((sum, repository) => sum + repository.total_deployment_time, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0b16]">
      <Header />
      <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <PageHeader
          eyebrow="Operations / deployments"
          title="Deployment activity"
          description="Inspect workflow outcomes, branch context, and delivery time without leaving the operational workspace."
        />
        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading deployment activity…</div>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">Unable to load deployment activity right now.</div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Deployment summary">
              <MetricCard label="Workflow runs" value={allLogs.length} detail="Runs in the current response" />
              <MetricCard label="Successful" value={allSuccessful} detail="Completed deployments" tone="emerald" />
              <MetricCard label="Failed" value={allFailed} detail="Runs needing attention" tone="rose" />
              <MetricCard label="Delivery time" value={formatTime(totalDeploymentTime)} detail="Combined deployment time" tone="amber" />
            </section>
            <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-5" aria-label="Workflow deployments table">
            <div
              className={isDark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
              style={{ height: '470px', width: '100%', borderRadius: 12, overflow: 'hidden' }}
            >
              <AgGridReact
                rowData={allLogs}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                pagination={true}
                paginationPageSize={20}
              />
            </div>
            </section>
            <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-8" aria-labelledby="deployment-metrics-heading">
            <h2 id="deployment-metrics-heading" className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Deployment metrics</h2>
            <div className="mt-6 flex w-full flex-col gap-8 md:flex-row">
              {/* Chart 1: Deployments per Repository */}
              <div className="flex-1" style={{ minWidth: 0 }}>
                <h3 className="text-lg font-semibold mb-2">Deployments by Status</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={repositories.map(r => ({
                      name: r.name,
                      successful_deployments: r.successful_deployments,
                      failed_deployments: r.failed_deployments,
                      total_workflows: r.total_workflows,
                    })) || []}
                    margin={{ top: 40, right: 20, left: 20, bottom: 40 }}
                  >
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={70} tick={{ fontSize: 12 }}>
                      <Label value="Repository" offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar dataKey="successful_deployments" name="Successful Deployments" fill="#82ca9d" />
                    <Bar dataKey="failed_deployments" name="Failed Deployments" fill="#ff7f7f" />
                    <Bar dataKey="total_workflows" name="Total Workflows" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Chart 2: Total Deployment Time per Repository */}
              <div className="flex-1" style={{ minWidth: 0 }}>
                <h3 className="text-lg font-semibold mb-2">Total Deployment Time (min)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={repositories.map(r => ({
                      name: r.name,
                      total_deployment_time_min: Math.round(r.total_deployment_time / 60000),
                      total_deployment_time_label: formatTime(r.total_deployment_time),
                    })) || []}
                    margin={{ top: 40, right: 20, left: 20, bottom: 40 }}
                  >
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={70} tick={{ fontSize: 12 }}>
                      <Label value="Repository" offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fontSize: 12 }} tickFormatter={(value) => `${value} min`} />
                    <Tooltip formatter={(_, __, props) => props.payload?.total_deployment_time_label || ''} />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar dataKey="total_deployment_time_min" name="Total Deployment Time" fill="#ffc658">
                      <LabelList dataKey="total_deployment_time_label" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DeploymentsAgGrid;
