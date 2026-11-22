/**
 * Operations API client.
 *
 * Deployment data comes from the self-hosted Supabase `deployments` schema
 * (api-v3.therama.dev), which a separate sync service keeps in step with
 * Vercel. Only the three anon-readable views are reachable with the public key.
 *
 * Project statuses still come from the existing edge function, because the
 * deployment rows carry a project status *name* that the badge resolves.
 */

export const API_BASE = 'https://api.therama.dev/functions/v1';

// Self-hosted Supabase (read-only public schema). Same defaults as staticApi.ts.
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://api-v3.therama.dev';
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  'sb_publishable_TvfycUXoZ1whU1e-L8qhH-_PwN2YmxB';

/* -------------------------------------------------------------------------- */
/* Deployment history                                                         */
/* -------------------------------------------------------------------------- */

/**
 * One row of `deployments.v_project_deployments` (api-v3.therama.dev).
 *
 * The first block keeps the exact column names the old `get-deployment-history`
 * edge function returned, so the existing components keep working. The second
 * block is new information from the Vercel API.
 */
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
  // New in the self-hosted backend (all optional).
  state?: string | null;
  vercel_deployment_id?: string;
  target?: string | null;
  ready_substate?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  inspector_url?: string | null;
  build_duration_seconds?: number | null;
  is_production?: boolean;
  github_repo?: string | null;
  github_org?: string | null;
  github_commit_author?: string | null;
  ready_at?: string | null;
}

const DEPLOYMENTS_SCHEMA = 'deployments';
const DEPLOYMENT_COLUMNS = [
  'id',
  'project_id',
  'version',
  'status',
  'deployment_time',
  'github_sha',
  'github_ref',
  'actor',
  'commit_message',
  'source',
  'deployment_url',
  'duration_in_seconds',
  'is_success',
  'created_at',
  'project_name',
  'state',
  'vercel_deployment_id',
  'target',
  'ready_substate',
  'error_code',
  'error_message',
  'inspector_url',
  'build_duration_seconds',
  'is_production',
  'github_repo',
  'github_org',
  'github_commit_author',
  'ready_at',
].join(',');

/**
 * Deployment history for one project (or all of them), newest first.
 * Read-only: `v_project_deployments` is the only thing the anon key can see.
 *
 * The limit is a safety cap, not a page size — the page aggregates over
 * whatever it receives, so a cap below the real row count would silently
 * understate every total. 500 is far above the current history (70 rows) while
 * still bounding the payload if the sync ever backfills a lot more.
 */
export async function fetchDeploymentHistory(projectId?: string): Promise<Deployment[]> {
  const params = new URLSearchParams({
    select: DEPLOYMENT_COLUMNS,
    order: 'deployment_time.desc',
    limit: '500',
  });
  if (projectId) params.set('project_id', `eq.${projectId}`);

  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/v_project_deployments?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Accept-Profile': DEPLOYMENTS_SCHEMA,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Unable to load deployment history (${response.status} ${response.statusText})`,
    );
  }
  return response.json() as Promise<Deployment[]>;
}

/* -------------------------------------------------------------------------- */
/* Deployment summaries (per project) and the Vercel project registry          */
/* -------------------------------------------------------------------------- */

/**
 * One row of `deployments.v_project_deployment_summary`.
 *
 * Aggregated server-side so the page does not have to pull every deployment
 * row just to count them. `total_deployments` is 0 for projects that exist in
 * `static.projects` but have never deployed through Vercel.
 */
export interface ProjectDeploymentSummary {
  project_id: string;
  project_name: string;
  total_deployments: number;
  successful_deployments: number;
  failed_deployments: number;
  production_deployments: number;
  last_deployed_at: string | null;
  last_production_success_at: string | null;
  avg_duration_in_seconds: number | null;
  first_deployed_at: string | null;
}

/** One row of `deployments.v_vercel_projects`. */
export interface VercelProject {
  vercel_project_id: string;
  vercel_project_name: string;
  production_domain: string | null;
  framework: string | null;
  static_project_id: string | null;
  is_mapped: boolean;
  static_project_title: string | null;
  total_deployments: number;
  last_deployed_at: string | null;
  last_production_success_at: string | null;
}

/** Shared read helper for the `deployments` schema views. */
async function selectDeployments<T>(view: string, query: string): Promise<T[]> {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${view}?${query}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Accept-Profile': DEPLOYMENTS_SCHEMA,
    },
  });
  if (!response.ok) {
    throw new Error(`Unable to load ${view} (${response.status} ${response.statusText})`);
  }
  return response.json() as Promise<T[]>;
}

/** Per-project deployment totals, busiest first. */
export function fetchProjectDeploymentSummaries(): Promise<ProjectDeploymentSummary[]> {
  return selectDeployments<ProjectDeploymentSummary>(
    'v_project_deployment_summary',
    'select=*&order=total_deployments.desc,project_name.asc',
  );
}

/** Every Vercel project, including the ones not yet mapped to the portfolio. */
export function fetchVercelProjects(): Promise<VercelProject[]> {
  return selectDeployments<VercelProject>(
    'v_vercel_projects',
    'select=*&order=total_deployments.desc,vercel_project_name.asc',
  );
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
  deploymentSummaries: ['deployment-summaries'] as const,
  vercelProjects: ['vercel-projects'] as const,
  edgeStatuses: ['edge-project-statuses'] as const,
  projects: ['projects'] as const,
  projectStatuses: ['project-statuses'] as const,
  socialLinks: ['social-links'] as const,
};
