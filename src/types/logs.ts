export interface Commit {
  sha: string;
  message: string;
  author: string;
  committer: string;
  timestamp: string;
}

export interface WorkflowLog {
  repo: string;
  run_id: number;
  workflow: string;
  status: string;
  conclusion: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  run_attempt: number;
  actor: string;
  event: string;
  url: string;
  duration: number;
  branch: string;
  commit: Commit;
}

export interface Repository {
  name: string;
  url: string;
  created_at: string;
  total_workflows: number;
  successful_deployments: number;
  failed_deployments: number;
  total_deployment_time: number;
  workflow_logs: WorkflowLog[];
}

export interface LogsResponse {
  repositories: Repository[];
}