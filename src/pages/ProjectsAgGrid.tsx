import React, { useState } from 'react';
import Header from '@/components/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from 'recharts';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';


import { ColDef, ValueFormatterParams, ICellRendererParams } from 'ag-grid-community';
import { useQuery } from '@tanstack/react-query';
import '../styles/globals.css';
import { ApiResponse } from './Repos';
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

const ProjectsAgGrid: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['repositories'],
    queryFn: async () => {
      const response = await fetch('https://api.therama.dev/functions/v1/github-get-all-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_by_repository: true,
          is_logs_required: false
        })
      });
      return response.json();
    },
  });

  const columnDefs: ColDef[] = [
    { 
      field: 'name',
      headerName: 'Repository',
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams) => {
        return (
          <a
            href={params.data.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
          >
            {params.value}
          </a>
        );
      }
    },
    {
      field: 'created_at',
      headerName: 'Created Date',
      sortable: true,
      filter: true,
      valueFormatter: (params: ValueFormatterParams) => {
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'total_workflows',
      headerName: 'Total Workflows',
      sortable: true,
      filter: true
    },
    {
      field: 'successful_deployments',
      headerName: 'Successful Deployments',
      sortable: true,
      filter: true
    },
    {
      field: 'failed_deployments',
      headerName: 'Failed Deployments',
      sortable: true,
      filter: true
    },
    {
      field: 'total_deployment_time',
      headerName: 'Total Deployment Time',
      sortable: true,
      filter: true,
      valueFormatter: (params: ValueFormatterParams) => {
        return formatTime(params.value);
      }
    }
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
  };

  const repositories = data?.repositories ?? [];
  const totalWorkflows = repositories.reduce((sum, repository) => sum + repository.total_workflows, 0);
  const successfulDeployments = repositories.reduce((sum, repository) => sum + repository.successful_deployments, 0);
  const failedDeployments = repositories.reduce((sum, repository) => sum + repository.failed_deployments, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0b16]">
      <Header />
      <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <PageHeader
          eyebrow="Operations / repositories"
          title="Repository pulse"
          description="A live view of workflow throughput and deployment performance across the projects behind the portfolio."
        />
        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading repository metrics…</div>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">Unable to load repository metrics right now.</div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Repository summary">
              <MetricCard label="Repositories" value={repositories.length} detail="Tracked in the workspace" />
              <MetricCard label="Workflows" value={totalWorkflows} detail="Total workflow runs" tone="amber" />
              <MetricCard label="Successful" value={successfulDeployments} detail="Completed deployments" tone="emerald" />
              <MetricCard label="Failed" value={failedDeployments} detail="Runs needing attention" tone="rose" />
            </section>
            <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-5" aria-label="Repository statistics table">
          <div
            className={isDark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
            style={{ height: '420px', width: '100%', borderRadius: 12, overflow: 'hidden' }}
          >
            <AgGridReact
              rowData={repositories}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={20}
            />
          </div>
            </section>
            <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-8" aria-labelledby="repository-metrics-heading">
        <h2 id="repository-metrics-heading" className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">Repository metrics</h2>
        <div className="mt-6 flex w-full flex-col gap-8 md:flex-row">
          {/* Chart 1: Repo vs Workflows/Deployments */}
          <div className="flex-1" style={{ minWidth: 0 }}>
            <h3 className="text-lg font-semibold mb-2">Workflows and Deployments</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={repositories.map(r => ({
                  name: r.name,
                  total_workflows: r.total_workflows,
                  successful_deployments: r.successful_deployments,
                  failed_deployments: r.failed_deployments,
                })) || []}
                margin={{ top: 40, right: 20, left: 20, bottom: 40 }}
              >
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={70} tick={{ fontSize: 12 }}>
                  <Label value="Repository" offset={-10} position="insideBottom" />
                </XAxis>
                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="total_workflows" name="Total Workflows" fill="#8884d8" />
                <Bar dataKey="successful_deployments" name="Successful Deployments" fill="#82ca9d" />
                <Bar dataKey="failed_deployments" name="Failed Deployments" fill="#ff7f7f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Chart 2: Repo vs Total Deployment Time */}
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
                  {/* Show formatted label above each bar */}
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

export default ProjectsAgGrid;