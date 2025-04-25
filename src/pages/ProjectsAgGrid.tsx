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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Repository Statistics</h1>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8 mb-8 border border-gray-200 dark:border-gray-800">
          <div
            className={isDark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
            style={{ height: '350px', width: '100%', borderRadius: 12, overflow: 'hidden' }}
          >
            <AgGridReact
              rowData={data?.repositories}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={20}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 md:p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-dark-purple">Repository Metrics</h2>
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Chart 1: Repo vs Workflows/Deployments */}
          <div className="flex-1" style={{ minWidth: 0 }}>
            <h3 className="text-lg font-semibold mb-2">Workflows and Deployments</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data?.repositories?.map(r => ({
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
                  {/* Show formatted label above each bar */}
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

export default ProjectsAgGrid;