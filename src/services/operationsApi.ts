/**
 * Operations API client.
 *
 * The URLs, HTTP methods, request bodies and query params here are IDENTICAL to
 * what the pages previously used inline. This module only centralises them so
 * the fetch logic and React Query keys are defined once instead of six times.
 */

import type { LogsResponse } from '@/types/logs';

export const API_BASE = 'https://api.therama.dev/functions/v1';

/* -------------------------------------------------------------------------- */
/* github-get-all-logs                                                        */
/* -------------------------------------------------------------------------- */

/** Repository-level metrics (no nested workflow logs). */
export interface RepositoryStats {
  name: string;
  url: string;
  created_at: string;
  total_workflows: number;
  successful_deployments: number;
  failed_deployments: number;
  total_deployment_time: number;
}

export interface RepositoryStatsResponse {
  repositories: RepositoryStats[];
}

/** Original request body for repository metrics. */
export const REPOSITORY_METRICS_BODY = {
  group_by_repository: true,
  is_logs_required: false,
} as const;

/** Original request body for workflow logs. */
export const WORKFLOW_LOGS_BODY = {
  is_logs_required: true,
  group_by_repository: true,
} as const;

async function postLogs<T>(body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/github-get-all-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load workflow data (${response.status} ${response.statusText})`,
    );
  }

  return response.json() as Promise<T>;
}

/** Repository metrics — `{ group_by_repository: true, is_logs_required: false }`. */
export function fetchRepositoryMetrics(): Promise<RepositoryStatsResponse> {
  return postLogs<RepositoryStatsResponse>(REPOSITORY_METRICS_BODY);
}

/** Workflow logs — `{ is_logs_required: true, group_by_repository: true }`. */
export function fetchWorkflowLogs(): Promise<LogsResponse> {
  return postLogs<LogsResponse>(WORKFLOW_LOGS_BODY);
}

/* -------------------------------------------------------------------------- */
/* Deployment history                                                         */
/* -------------------------------------------------------------------------- */

export interface Deployment {
  id: string;
  project_id: string;
  version: string;
  status: string;
  deployment_time: string;
  github_sha: string;
  github_ref: string;
  actor: string;
  commit_message: string;
  source: string;
  deployment_url: string;
  duration_in_seconds: number;
  is_success: boolean;
  created_at: string;
  project_name?: string;
}

/**
 * `GET /get-deployment-history` with an optional `?project_id=`.
 * The `project_id` query param is preserved exactly as before.
 */
export async function fetchDeploymentHistory(projectId?: string): Promise<Deployment[]> {
  const url = projectId
    ? `${API_BASE}/get-deployment-history?project_id=${projectId}`
    : `${API_BASE}/get-deployment-history`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Unable to load deployment history (${response.status} ${response.statusText})`,
    );
  }
  return response.json() as Promise<Deployment[]>;
}

/* -------------------------------------------------------------------------- */
/* Project statuses (edge function, used by the deployment dialog)             */
/* -------------------------------------------------------------------------- */

export interface EdgeProjectStatus {
  id: string;
  name: string;
  description: string;
  class: string;
}

export interface EdgeStatusResponse {
  statuses?: EdgeProjectStatus[];
}

/** `GET /get-project-statuses` — returns `{ statuses: [...] }`. */
export async function fetchEdgeProjectStatuses(): Promise<EdgeProjectStatus[]> {
  const response = await fetch(`${API_BASE}/get-project-statuses`);
  if (!response.ok) {
    throw new Error(
      `Unable to load project statuses (${response.status} ${response.statusText})`,
    );
  }
  const data = (await response.json()) as EdgeStatusResponse;
  return data.statuses ?? [];
}

/* -------------------------------------------------------------------------- */
/* Query keys                                                                 */
/* -------------------------------------------------------------------------- */

export const queryKeys = {
  repositories: ['repositories'] as const,
  workflowLogs: ['workflow-logs'] as const,
  deployments: ['deployments'] as const,
  deploymentHistory: (projectId?: string) => ['deployment-history', projectId ?? 'all'] as const,
  edgeStatuses: ['edge-project-statuses'] as const,
  projects: ['projects'] as const,
  projectStatuses: ['project-statuses'] as const,
  socialLinks: ['social-links'] as const,
};
