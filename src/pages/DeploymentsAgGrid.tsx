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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-2 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Workflow Deployments Logs</h1>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8 mb-8 border border-gray-200 dark:border-gray-800">
            <div
              className={isDark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
              style={{ height: '420px', width: '100%', borderRadius: 12, overflow: 'hidden' }}
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
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-dark-purple">Deployment Metrics</h2>
            <div className="flex flex-col md:flex-row gap-8 w-full">
              {/* Chart 1: Deployments per Repository */}
              <div className="flex-1" style={{ minWidth: 0 }}>
                <h3 className="text-lg font-semibold mb-2">Deployments by Status</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={data?.repositories?.map(r => ({
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
                    data={data?.repositories?.map(r => ({
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
          </div>
        </div>
      </div>
    </>
  );
};

export default DeploymentsAgGrid;
